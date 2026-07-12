import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ProfileIcon, RulerIcon, WarningIcon, EditIcon, RefreshIcon } from '../components/ui/icons';
import { AvatarViewer } from '../components/avatar/AvatarViewer';
import { MeasurementDisplay } from '../components/avatar/MeasurementDisplay';
import { useAvatarStore } from '../store/useAvatarStore';
import { rescaleMeasurements } from '../utils/measurementsUtils';
import { calculateKibbe } from '../utils/kibbeCalculator';

export function AvatarResultScreen() {
  const navigate = useNavigate();
  const { measurements, kibbeResult, warnings, setResult } = useAvatarStore();
  const [editingHeight, setEditingHeight] = useState(false);
  const [heightInput, setHeightInput] = useState(String(measurements?.height ?? 165));

  if (!measurements || !kibbeResult) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-8 gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
        >
          <ProfileIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-[22px] text-ink">Аватар ещё не создан</h2>
        <Button onClick={() => navigate('/avatar/create')}>Создать аватар</Button>
      </div>
    );
  }

  const applyNewHeight = () => {
    const newHeight = Number(heightInput);
    if (!newHeight || newHeight < 100 || newHeight > 220) return;
    const rescaled = rescaleMeasurements(measurements, newHeight);
    const kibbe = calculateKibbe(rescaled);
    setResult(rescaled, kibbe, warnings);
    setEditingHeight(false);
  };

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <button onClick={() => navigate('/profile')} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>
      <h1 className="font-display text-[24px] text-ink mb-4">Твой цифровой двойник</h1>

      <AvatarViewer measurements={measurements} />
      <p className="text-center text-[11px] text-olive mt-2 mb-5">← свайп для вращения →</p>

      <div className="flex flex-col gap-4">
        <MeasurementDisplay measurements={measurements} />

        <div className="bg-card rounded-2xl shadow-card p-5">
          <p className="text-[13px] font-bold text-ink mb-2 flex items-center gap-1.5">
            <RulerIcon className="w-4 h-4 text-lavender" /> Тип фигуры (Кибби)
          </p>
          <p className="font-display text-[22px] text-ink mb-1">{kibbeResult.type}</p>
          <p className="text-[12px] text-olive mb-3">Уверенность: {kibbeResult.confidence}% · {kibbeResult.yinYangBalance}</p>
          <p className="text-[13px] text-ink-soft leading-relaxed mb-3">«{kibbeResult.description}»</p>
          <div className="flex flex-col gap-1.5">
            {kibbeResult.recommendations.map((r) => (
              <p key={r} className="text-[12px] text-ink-soft flex gap-2">
                <span className="text-lavender">→</span>
                {r}
              </p>
            ))}
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="rounded-2xl p-4 bg-pink-light/30 border border-pink/40">
            <p className="text-[12px] font-bold text-ink mb-1.5 flex items-center gap-1.5">
              <WarningIcon className="w-3.5 h-3.5 text-pink" /> Точность может быть ниже обычной
            </p>
            {warnings.map((w) => (
              <p key={w.point} className="text-[11px] text-ink-soft">{w.point}</p>
            ))}
          </div>
        )}

        {editingHeight ? (
          <div className="bg-card rounded-2xl shadow-card p-4">
            <label className="text-[13px] font-bold text-ink block mb-2">Уточнить рост, см</label>
            <input
              type="number"
              inputMode="numeric"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              className="w-full text-[15px] font-semibold text-ink bg-cream rounded-xl px-4 py-2.5 outline-none mb-3"
            />
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setEditingHeight(false)}>Отмена</Button>
              <Button className="flex-1" onClick={applyNewHeight}>Пересчитать</Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setEditingHeight(true)}>
            <EditIcon className="w-4 h-4" /> Уточнить рост
          </Button>
        )}

        <Button variant="ghost" onClick={() => navigate('/avatar/create')}>
          <RefreshIcon className="w-4 h-4" /> Переснять
        </Button>

        <Button onClick={() => navigate('/profile')}>Сохранить и продолжить</Button>
      </div>
    </div>
  );
}

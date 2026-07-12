import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { WarningIcon } from '../components/ui/icons';
import { PhotoSlotCard } from '../components/avatar/PhotoSlotCard';
import { detectPose, loadImageFromFile } from '../services/poseDetector';
import { buildFrontLandmarks, buildSideLandmarks, calculateMeasurements, toPixelSpace, type LowVisibilityWarning } from '../utils/measurementsUtils';
import { calculateKibbe } from '../utils/kibbeCalculator';
import { useAvatarStore } from '../store/useAvatarStore';
import { useColorAnalysis } from '../hooks/useColorAnalysis';

type Slot = 'front' | 'side' | 'fullbody';

const slotInfo: Record<Slot, { title: string; hint: string }> = {
  front: { title: 'Фото 1: Спереди', hint: 'Встань прямо, руки чуть отведены от тела' },
  side: { title: 'Фото 2: Сбоку', hint: 'Правый профиль, рука вдоль тела' },
  fullbody: { title: 'Фото 3: В полный рост', hint: 'В облегающей одежде для точных мерок' },
};

export function AvatarCreatorScreen() {
  const navigate = useNavigate();
  const setResult = useAvatarStore((s) => s.setResult);
  const { result: colorResult, save: saveColorResult } = useColorAnalysis();

  const [files, setFiles] = useState<Record<Slot, File | null>>({ front: null, side: null, fullbody: null });
  const [previews, setPreviews] = useState<Record<Slot, string | null>>({ front: null, side: null, fullbody: null });
  const [height, setHeight] = useState('165');
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const allUploaded = files.front && files.side && files.fullbody;

  const handleSelect = (slot: Slot, file: File) => {
    setFiles((f) => ({ ...f, [slot]: file }));
    setPreviews((p) => {
      if (p[slot]) URL.revokeObjectURL(p[slot]!);
      return { ...p, [slot]: URL.createObjectURL(file) };
    });
    setError(null);
  };

  const handleCreate = async () => {
    if (!files.front || !files.side || !files.fullbody) return;
    setProcessing(true);
    setError(null);
    const warnings: LowVisibilityWarning[] = [];

    try {
      setStatusText('Строим скелет...');
      const frontImg = await loadImageFromFile(files.front);
      const frontRaw = await detectPose(frontImg);
      if (!frontRaw) {
        setError('Не нашли тело на фото 1 (спереди). Попробуй фото при хорошем освещении, во весь рост.');
        setProcessing(false);
        return;
      }
      const frontPx = toPixelSpace(frontRaw, frontImg.naturalWidth, frontImg.naturalHeight);
      const { landmarks: front, warnings: frontWarnings } = buildFrontLandmarks(frontPx);
      warnings.push(...frontWarnings);

      setStatusText('Определяем пропорции...');
      // Профильное фото: используем только для проверки, что тело найдено (визуальная
      // валидация). Настоящую глубину по сегментам корпуса MediaPipe не даёт (это точки
      // суставов, не силуэт) — сама глубина считается статистической аппроксимацией
      // от фронтальных мерок, см. buildSideLandmarks().
      const sideImg = await loadImageFromFile(files.side);
      const sideRaw = await detectPose(sideImg);
      if (!sideRaw) {
        warnings.push({ point: 'фото профиля — тело не найдено, используем аппроксимацию глубины', visibility: 0 });
      }

      // Фото в полный рост: тоже только проверка присутствия тела. Честная оговорка —
      // сравнить рост в пикселях между разными фото нельзя без знания расстояния до
      // камеры на каждом кадре, поэтому реальной "кросс-валидации" тут не считаем.
      const fullbodyImg = await loadImageFromFile(files.fullbody);
      const fullbodyRaw = await detectPose(fullbodyImg);
      if (!fullbodyRaw) {
        warnings.push({ point: 'фото в полный рост — тело не найдено', visibility: 0 });
      }

      setStatusText('Калибруем модель...');
      const side = buildSideLandmarks(front);
      const userHeight = Number(height) || 165;
      const measurements = calculateMeasurements(front, side, userHeight);
      const kibbe = calculateKibbe(measurements);

      setResult(measurements, kibbe, warnings);

      if (colorResult) {
        saveColorResult({ ...colorResult, kibbeType: kibbe.type });
      }

      navigate('/avatar/result', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Что-то пошло не так при анализе фото.');
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
        <div
          className="w-20 h-20 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light), var(--color-blue-light))' }}
        />
        <p className="text-[15px] font-semibold text-ink">{statusText}</p>
        <p className="text-[12px] text-olive max-w-[260px]">
          Первый анализ может занять до минуты — грузим модель распознавания позы
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <button onClick={() => navigate('/profile')} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>
      <h1 className="font-display text-[26px] text-ink mb-1">Создаём твой цифровой двойник</h1>
      <p className="text-[13px] text-olive mb-6">3 фото. 30 секунд.</p>

      <div className="flex flex-col gap-3 mb-6">
        {(['front', 'side', 'fullbody'] as Slot[]).map((slot) => (
          <PhotoSlotCard
            key={slot}
            title={slotInfo[slot].title}
            hint={slotInfo[slot].hint}
            previewUrl={previews[slot]}
            onSelect={(file) => handleSelect(slot, file)}
          />
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card p-4 mb-4">
        <label className="text-[13px] font-bold text-ink block mb-2">Твой рост, см</label>
        <input
          type="number"
          inputMode="numeric"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full text-[15px] font-semibold text-ink bg-cream rounded-xl px-4 py-2.5 outline-none"
          placeholder="165"
        />
        <p className="text-[11px] text-olive mt-2">Нужен для калибровки мерок. Без него используем 165 см — точность будет ниже.</p>
      </div>

      <p className="text-[11px] text-olive mb-4 flex items-start gap-1.5">
        <WarningIcon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-pink" />
        Фото не сохраняются на сервере — обрабатываются локально, в браузере. Мерки приблизительные (по позе на фото), не заменяют портновский замер.
      </p>

      {error && <p className="text-[13px] text-error font-semibold mb-4">{error}</p>}

      <Button className="w-full" disabled={!allUploaded} onClick={handleCreate}>
        Создать аватар
      </Button>
    </div>
  );
}

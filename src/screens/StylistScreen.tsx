import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { PaletteIcon, BagIcon, DownloadIcon, RefreshIcon } from '../components/ui/icons';
import { ColorGrid } from '../components/ui/ColorGrid';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { useAvatarStore } from '../store/useAvatarStore';
import { downloadPaletteImage } from '../utils/downloadPalette';

const tabs = [
  { key: 'base', label: 'Базовые' },
  { key: 'accent', label: 'Акцентные' },
  { key: 'avoid', label: 'Избегать' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export function StylistScreen() {
  const { result, clear } = useColorAnalysis();
  const { kibbeResult } = useAvatarStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('base');

  if (!result) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-8 gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
        >
          <PaletteIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-[22px] text-ink">Узнай свой цветотип</h2>
        <p className="text-[13px] text-olive max-w-[240px]">
          5 вопросов — и получишь палитру с HEX-кодами под твой тон кожи
        </p>
        <Button onClick={() => navigate('/analysis/color-type')} className="mt-2">
          Пройти анализ
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+110px)]">
      <p className="text-[13px] text-olive mb-1">Твой цветотип</p>
      <h1 className="font-display text-[28px] text-ink mb-1">{result.seasonalType}</h1>
      <p className="text-[12px] text-olive mb-4">{result.koreanSubtype}</p>
      <p className="text-[13px] text-ink-soft leading-relaxed mb-1">
        Тип фигуры: <span className="font-semibold text-ink">{kibbeResult?.type ?? result.kibbeType}</span>
        {kibbeResult && <span className="text-[11px] text-lavender font-semibold ml-2">уточнено по меркам</span>}
      </p>
      <p className="text-[13px] text-ink-soft leading-relaxed mb-6">{result.description}</p>
      {!kibbeResult && (
        <button onClick={() => navigate('/avatar/create')} className="text-[12px] font-semibold text-lavender mb-6 -mt-4 block">
          Создать 3D-аватар, чтобы уточнить тип фигуры по реальным меркам →
        </button>
      )}

      <p className="text-[13px] font-bold text-ink mb-3 flex items-center gap-1.5">
        <PaletteIcon className="w-4 h-4 text-lavender" /> Палитра
      </p>
      <div className="flex gap-4 mb-5">
        {tabs.map((t) => (
          <Chip key={t.key} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)} />
        ))}
      </div>

      <ColorGrid swatches={result.palette[tab]} />

      <button
        onClick={() => navigate('/stylist/capsule')}
        className="w-full flex items-center gap-3 bg-card rounded-2xl shadow-card p-4 mt-6 text-left"
      >
        <BagIcon className="w-6 h-6 text-lavender shrink-0" />
        <span className="flex-1">
          <span className="block text-[14px] font-bold text-ink">Капсульный гардероб</span>
          <span className="block text-[12px] text-olive">Готовые луки под бюджет со ссылками на WB и Lamoda</span>
        </span>
        <span className="text-olive">→</span>
      </button>

      <div className="flex flex-col gap-3 mt-6">
        <Button variant="secondary" onClick={() => downloadPaletteImage(result)}>
          <DownloadIcon className="w-4 h-4" /> Скачать палитру как картинку
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            clear();
            navigate('/analysis/color-type');
          }}
        >
          <RefreshIcon className="w-4 h-4" /> Пройти анализ заново
        </Button>
      </div>
    </div>
  );
}

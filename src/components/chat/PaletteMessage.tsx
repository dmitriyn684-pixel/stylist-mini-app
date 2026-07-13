import type { ColorSwatch } from '../../types/analysis';

const GROUPS: { key: 'base' | 'accent' | 'avoid'; label: string }[] = [
  { key: 'base', label: 'Базовые' },
  { key: 'accent', label: 'Акцентные' },
  { key: 'avoid', label: 'Избегать' },
];

function SwatchRow({ swatch }: { swatch: ColorSwatch }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full border border-ink/10 shrink-0" style={{ background: swatch.hex }} />
      <span className="text-[13px] text-ink">{swatch.name}</span>
      <span className="text-[11px] font-mono text-olive ml-auto shrink-0">{swatch.hex.toUpperCase()}</span>
    </div>
  );
}

interface PaletteMessageProps {
  palette: { base: ColorSwatch[]; accent: ColorSwatch[]; avoid: ColorSwatch[] };
}

/**
 * Настоящие HEX из анализа пользователя вместо одинаковых квадратиков,
 * которые LLM рисует в свободном тексте (текст не может гарантированно
 * нести цвет — только сама вёрстка через background-color).
 */
export function PaletteMessage({ palette }: PaletteMessageProps) {
  return (
    <div className="flex flex-col gap-3 w-full min-w-[220px]">
      {GROUPS.map(({ key, label }) => {
        const swatches = palette[key];
        if (!swatches?.length) return null;
        return (
          <div key={key}>
            <p className="text-[11px] font-bold text-olive uppercase tracking-wide mb-1.5">{label}</p>
            <div className="flex flex-col gap-1.5">
              {swatches.map((s) => (
                <SwatchRow key={s.hex} swatch={s} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

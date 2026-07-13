import { useState } from 'react';
import { CheckIcon } from './icons';
import type { ColorSwatch } from '../../types/analysis';

/**
 * Настоящие цветные плашки по HEX из анализа. Вынесено из StylistScreen,
 * чтобы переиспользовать в чате AI-стилиста вместо квадратиков, которые
 * LLM рисует в свободном тексте без привязки к реальному цвету.
 */
export function ColorGrid({ swatches }: { swatches: ColorSwatch[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      // Буфер обмена недоступен (например, нет разрешения) — просто подсветим и промолчим
    }
    setCopied(hex);
    setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1200);
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {swatches.map((s) => (
        <button key={s.hex} onClick={() => copy(s.hex)} className="flex flex-col items-center gap-1.5">
          <span
            className="w-full aspect-square rounded-2xl border border-ink/10 flex items-center justify-center text-[10px] font-bold"
            style={{ background: s.hex, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
          >
            {copied === s.hex && <CheckIcon className="w-4 h-4" />}
          </span>
          <span className="text-[10px] font-mono text-olive">{s.hex.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

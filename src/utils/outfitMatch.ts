import type { ColorAnalysisResult } from '../types/analysis';

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

const MAX_DISTANCE = Math.sqrt(255 ** 2 * 3);

/**
 * Реальный (не выдуманный) процент совпадения — сравнивает HEX-цвета вещей
 * лука с настоящей палитрой пользователя (палитра из анализа бота или
 * скана фото). Чем ближе цвета лука к "своим" оттенкам и дальше от
 * "избегать" — тем выше процент. Без палитры честно возвращаем null,
 * а не подставляем случайное число.
 *
 * items — только { color: string }, а не конкретный CapsuleItem/WardrobeItem,
 * чтобы одна и та же функция работала и для каталога, и для реального
 * гардероба пользователя (см. outfitGenerator.ts).
 */
export function computeOutfitMatch(items: { color: string }[], palette: ColorAnalysisResult['palette'] | null): number | null {
  if (!palette || items.length === 0) return null;

  const good = [...palette.base, ...palette.accent].map((c) => c.hex);
  const bad = palette.avoid.map((c) => c.hex);
  if (good.length === 0) return null;

  const scores = items.map((item) => {
    const goodDist = Math.min(...good.map((hex) => colorDistance(item.color, hex)));
    if (bad.length === 0) {
      return Math.max(0, 100 - (goodDist / MAX_DISTANCE) * 100);
    }
    const badDist = Math.min(...bad.map((hex) => colorDistance(item.color, hex)));
    return (badDist / (goodDist + badDist)) * 100;
  });

  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return Math.round(avg);
}

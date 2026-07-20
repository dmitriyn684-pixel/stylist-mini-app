import type { ColorAnalysisResult, ColorSwatch } from '../../types/analysis';
import type { PaletteColor, UserPalette } from './ColorPaletteDrawer';

export const fallbackPalette: UserPalette = {
  seasonalType: 'Dark Winter',
  title: 'Тёмная Зима',
  description: 'Глубокие, холодные и контрастные оттенки.',
  core: [
    { name: 'Холодный сапфировый', hex: '#1B2A4A' },
    { name: 'Глубокий изумрудный', hex: '#005F56' },
    { name: 'Винный', hex: '#6E1E2D' },
  ],
  accents: [
    { name: 'Фуксия', hex: '#C2185B' },
    { name: 'Ледяной розовый', hex: '#F2D7E6' },
  ],
  neutrals: [
    { name: 'Чёрный', hex: '#050505' },
    { name: 'Холодный графит', hex: '#4A4A4A' },
    { name: 'Оптический белый', hex: '#F8F8F8' },
  ],
  avoid: [
    { name: 'Тёплый бежевый', hex: '#D4B48C' },
    { name: 'Горчичный', hex: '#B58A24' },
  ],
  isFallback: true,
};

const NEUTRAL_NAME = /ч[её]рн|бел|сер|графит|беж|молоч|крем|ivory|black|white|grey|gray|neutral/i;

function hexSaturation(hex: string): number | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;

  const value = match[1];
  const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(...channels);
  const min = Math.min(...channels);
  const lightness = (max + min) / 2;
  if (max === min) return 0;
  return ((max - min) / (1 - Math.abs(2 * lightness - 1))) * 100;
}

function isNeutral(color: ColorSwatch): boolean {
  const saturation = hexSaturation(color.hex);
  return NEUTRAL_NAME.test(color.name) || (saturation !== null && saturation <= 18);
}

function copyColors(colors: ColorSwatch[]): PaletteColor[] {
  return colors.map(({ name, hex }) => ({ name, hex }));
}

export function createUserPalette(result: ColorAnalysisResult | null): UserPalette {
  const hasColors = Boolean(
    result && (result.palette.base.length || result.palette.accent.length || result.palette.avoid.length)
  );
  if (!result || !hasColors) return fallbackPalette;

  const neutralColors = result.palette.base.filter(isNeutral);
  const coreColors = result.palette.base.filter((color) => !isNeutral(color));

  return {
    seasonalType: result.seasonalType || undefined,
    title: result.koreanSubtype || result.seasonalType || undefined,
    description: result.description || 'Палитра будет уточняться по мере анализа гардероба.',
    core: copyColors(coreColors),
    accents: copyColors(result.palette.accent),
    neutrals: copyColors(neutralColors),
    avoid: copyColors(result.palette.avoid),
    isFallback: false,
  };
}

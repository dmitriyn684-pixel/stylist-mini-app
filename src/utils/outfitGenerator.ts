import type { WardrobeItem, WardrobeCategory } from '../types/wardrobe';
import type { ColorAnalysisResult } from '../types/analysis';
import { colorDistance } from './outfitMatch';

export interface GeneratedOutfit {
  items: WardrobeItem[];
}

// Ранжируем кандидатов категории по близости к палитре пользователя, лучший
// вариант первым — так кнопка "новый лук" (variant++) реально перебирает
// вещи, а не показывает всегда одну и ту же комбинацию.
function rankByPalette(items: WardrobeItem[], palette: ColorAnalysisResult['palette'] | null): WardrobeItem[] {
  if (!palette) return items;
  const good = [...palette.base, ...palette.accent].map((c) => c.hex);
  if (good.length === 0) return items;
  return [...items].sort((a, b) => {
    const da = Math.min(...good.map((hex) => colorDistance(a.color, hex)));
    const db = Math.min(...good.map((hex) => colorDistance(b.color, hex)));
    return da - db;
  });
}

/**
 * Собирает образ из РЕАЛЬНОГО гардероба пользователя — целиком на клиенте,
 * без сервера. В вещах нет тегов "для офиса"/"для спорта" — это просто
 * лучшее сочетание категорий (платье, или верх+низ) плюс обувь/аксессуары,
 * если есть, отсортированное по цвету под палитру, если она известна.
 * Если в гардеробе банально не хватает вещей на образ — честно null,
 * вызывающий код должен откатиться на каталог или показать пустое состояние.
 */
export function generateOutfitFromWardrobe(
  items: WardrobeItem[],
  palette: ColorAnalysisResult['palette'] | null,
  variant = 0
): GeneratedOutfit | null {
  const byCategory = (cat: WardrobeCategory) => rankByPalette(items.filter((i) => i.category === cat), palette);

  const dresses = byCategory('Платья');
  const tops = byCategory('Верх');
  const bottoms = byCategory('Низ');
  const shoes = byCategory('Обувь');
  const accessories = byCategory('Аксессуары');

  const canTopBottom = tops.length > 0 && bottoms.length > 0;
  const canDress = dresses.length > 0;
  if (!canTopBottom && !canDress) return null;

  const useDress = canDress && (!canTopBottom || variant % 2 === 1);
  const pick = (list: WardrobeItem[]) => list[variant % list.length];

  const base = useDress ? [pick(dresses)] : [pick(tops), pick(bottoms)];
  const extras = [shoes.length ? pick(shoes) : null, accessories.length ? pick(accessories) : null];

  return { items: [...base, ...extras].filter((i): i is WardrobeItem => i !== null) };
}

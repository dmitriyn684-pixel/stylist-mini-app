import { useMemo, useState } from 'react';
import { useColorAnalysis } from '../../hooks/useColorAnalysis';
import { CAPSULE_ITEMS } from '../../utils/capsuleData';
import { wildberriesSearchUrl, lamodaSearchUrl } from '../../utils/marketplaceLinks';
import { colorDistance, computeOutfitMatch } from '../../utils/outfitMatch';
import { ShoppingIcon } from '../ui/icons';
import type { CapsuleItem } from '../../types/capsule';
import type { ColorSwatch } from '../../types/analysis';

type RankedItem = { item: CapsuleItem; match: number | null };

function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}

function closestSwatchName(color: string, swatches: ColorSwatch[]): string | null {
  if (swatches.length === 0) return null;
  let best = swatches[0];
  let bestDist = colorDistance(color, best.hex);
  for (const s of swatches.slice(1)) {
    const d = colorDistance(color, s.hex);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best.name;
}

export function AiShoppingSection() {
  const { result: colorResult } = useColorAnalysis();
  const [variant, setVariant] = useState(dayIndex);
  const palette = colorResult?.palette ?? null;

  // Ранжируем каталог по реальному цветовому совпадению с палитрой
  // пользователя (та же функция, что и для луков) — без палитры честно
  // не ранжируем, а не подставляем случайный % совпадения.
  const ranked = useMemo<RankedItem[]>(
    () => CAPSULE_ITEMS.map((item) => ({ item, match: computeOutfitMatch([item], palette) })).sort(
      (a, b) => (b.match ?? 0) - (a.match ?? 0)
    ),
    [palette]
  );

  const hero = useMemo<RankedItem>(() => {
    if (palette) return ranked[variant % Math.min(ranked.length, 8)];
    const basics = CAPSULE_ITEMS.filter((i) => i.styles.includes('work') && i.styles.includes('casual'));
    const pool = basics.length > 0 ? basics : CAPSULE_ITEMS;
    return { item: pool[variant % pool.length], match: null };
  }, [ranked, palette, variant]);

  const miniItems = useMemo(() => {
    const usedCategories = new Set([hero.item.category]);
    const picks: CapsuleItem[] = [];
    for (const { item } of ranked) {
      if (picks.length >= 3) break;
      if (item.id === hero.item.id || usedCategories.has(item.category)) continue;
      usedCategories.add(item.category);
      picks.push(item);
    }
    return picks;
  }, [ranked, hero]);

  const heroSwatchName = palette ? closestSwatchName(hero.item.color, [...palette.base, ...palette.accent]) : null;

  const reason = palette
    ? heroSwatchName
      ? `Оттенок близок к «${heroSwatchName}» из твоей палитры — совпадение ${hero.match}%.`
      : `Хорошо сочетается с твоей цветовой палитрой — совпадение ${hero.match}%.`
    : 'Универсальная база для капсульного гардероба. Пройди анализ цветотипа в боте — и AI будет подбирать точно под твою палитру.';

  return (
    <section className="shopping-section">
      <div className="section-title">
        <div>
          <h2>AI Shopping</h2>
          <p>Персональные рекомендации</p>
        </div>
        <button
          type="button"
          className="shopping-ai"
          onClick={() => setVariant((v) => v + 1)}
          aria-label="Другая подборка"
        >
          <ShoppingIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="shopping-card">
        <div className="shopping-photo">
          <div
            className="shopping-photo-fill"
            style={{
              background: `linear-gradient(160deg, color-mix(in srgb, ${hero.item.color} 55%, white), ${hero.item.color})`,
            }}
          />
          <div className="shopping-badge">AI PICK</div>
          {hero.match !== null && <div className="match">{hero.match}% Match</div>}
        </div>

        <div className="shopping-info">
          <h3>{hero.item.name}</h3>
          <p>{reason}</p>

          <div className="shopping-price">
            <div>
              <b>{hero.item.price.toLocaleString('ru-RU')} ₽</b>
              <span>{hero.item.category} · Wildberries</span>
            </div>
            <a
              className="buy-btn"
              href={wildberriesSearchUrl(hero.item.name)}
              target="_blank"
              rel="noreferrer"
            >
              Купить
            </a>
          </div>

          <a
            className="cheaper-link"
            href={lamodaSearchUrl(hero.item.name)}
            target="_blank"
            rel="noreferrer"
          >
            Найти дешевле на Lamoda →
          </a>
        </div>
      </div>

      <div className="shopping-grid">
        {miniItems.map((item) => (
          <a key={item.id} className="mini-item" href={wildberriesSearchUrl(item.name)} target="_blank" rel="noreferrer">
            <div
              className="mini-item-fill"
              style={{
                background: `linear-gradient(160deg, color-mix(in srgb, ${item.color} 55%, white), ${item.color})`,
              }}
            />
            <p>{item.category}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

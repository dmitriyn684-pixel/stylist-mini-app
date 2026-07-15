import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarViewer } from '../avatar/AvatarViewer';
import { zoneByCategory } from '../../utils/mannequinZones';
import { CAPSULE_LOOKS, lookItems } from '../../utils/capsuleData';
import { computeOutfitMatch } from '../../utils/outfitMatch';
import { generateOutfitFromWardrobe } from '../../utils/outfitGenerator';
import { useAvatarStore } from '../../store/useAvatarStore';
import { useColorAnalysis } from '../../hooks/useColorAnalysis';
import { useWardrobeStore } from '../../store/useWardrobeStore';
import type { CapsuleStyle } from '../../types/capsule';
import type { WardrobeCategory } from '../../types/wardrobe';
import type { MannequinHighlight } from '../avatar/ParametricMannequin';

type OutfitCategory = 'business' | 'date' | 'travel' | 'evening' | 'sport' | 'luxury';

const CATEGORIES: { key: OutfitCategory; label: string }[] = [
  { key: 'business', label: 'Business' },
  { key: 'date', label: 'Date' },
  { key: 'travel', label: 'Travel' },
  { key: 'evening', label: 'Evening' },
  { key: 'sport', label: 'Sport' },
  { key: 'luxury', label: 'Luxury' },
];

// Каталог (CAPSULE_LOOKS) реально размечен только тремя стилями — не стал
// придумывать Travel/Sport/Luxury без данных под ними (см. обсуждение).
// Для этих трёх категорий, если и в гардеробе нечего предложить, честно
// показываем пустое состояние вместо чужого лука под неверным лейблом.
const CATALOG_STYLE: Partial<Record<OutfitCategory, CapsuleStyle>> = {
  business: 'work',
  date: 'casual',
  evening: 'evening',
};

const CATEGORY_EMOJI: Record<WardrobeCategory, string> = {
  Верх: '🤍',
  Низ: '👖',
  Платья: '👗',
  Обувь: '👠',
  Аксессуары: '👜',
};

function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}

export function AiOutfitSection() {
  const navigate = useNavigate();
  const measurements = useAvatarStore((s) => s.measurements);
  const { result: colorResult } = useColorAnalysis();
  const wardrobeItems = useWardrobeStore((s) => s.items);

  const [category, setCategory] = useState<OutfitCategory>('business');
  const [variant, setVariant] = useState(dayIndex);

  const palette = colorResult?.palette ?? null;

  const wardrobeOutfit = useMemo(
    () => generateOutfitFromWardrobe(wardrobeItems, palette, variant),
    [wardrobeItems, palette, variant]
  );

  const catalogStyle = CATALOG_STYLE[category];
  const catalogLooks = useMemo(
    () => (catalogStyle ? CAPSULE_LOOKS.filter((l) => l.style === catalogStyle) : []),
    [catalogStyle]
  );
  const catalogLook = catalogLooks.length > 0 ? catalogLooks[variant % catalogLooks.length] : null;

  const source: 'wardrobe' | 'catalog' | 'empty' = wardrobeOutfit ? 'wardrobe' : catalogLook ? 'catalog' : 'empty';
  const items = useMemo(() => {
    if (source === 'wardrobe') return wardrobeOutfit!.items;
    if (source === 'catalog') return lookItems(catalogLook!);
    return [];
  }, [source, wardrobeOutfit, catalogLook]);

  const match = useMemo(() => computeOutfitMatch(items, palette), [items, palette]);

  const highlights = useMemo<MannequinHighlight[]>(() => {
    const result: MannequinHighlight[] = [];
    for (const item of items) {
      const zone = zoneByCategory[item.category];
      if (zone) result.push({ zone, color: item.color });
    }
    return result;
  }, [items]);

  const handleCategoryChange = (key: OutfitCategory) => {
    setCategory(key);
    setVariant(dayIndex());
  };

  const handleShuffle = () => setVariant((v) => v + 1);

  const categoryLabel = CATEGORIES.find((c) => c.key === category)?.label;

  return (
    <section className="outfit-section">
      <div className="section-title">
        <div>
          <h2>Луки дня</h2>
          <p>AI создаёт образы под тебя</p>
        </div>
        <button type="button" className="magic-btn" onClick={handleShuffle} aria-label="Другой лук">
          ✨
        </button>
      </div>

      {source === 'empty' ? (
        <div className="outfit-card">
          <p className="text-center text-[13px] text-olive px-6 py-10">
            Пока нечего предложить для категории «{categoryLabel}» — в гардеробе не хватает вещей на образ, а
            готовых подборок под эту категорию ещё нет. Попробуй другую категорию или добавь вещи в гардероб.
          </p>
        </div>
      ) : (
        <div className="outfit-card">
          <div className="outfit-image">
            {measurements ? (
              <AvatarViewer measurements={measurements} highlights={highlights} />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
              >
                {items.map((i) => (
                  <span
                    key={i.id}
                    className="w-10 h-10 rounded-full border border-white/60"
                    style={{ background: i.color }}
                  />
                ))}
              </div>
            )}
            {match !== null && <div className="match">{match}% Match</div>}
          </div>

          <div className="outfit-info">
            <h3>{source === 'wardrobe' ? 'Образ из твоего гардероба' : catalogLook!.name}</h3>
            <p>
              {categoryLabel} · {items.length} вещ{items.length === 1 ? 'ь' : 'ей'}
              {source === 'catalog' && (
                <>
                  {' '}· из каталога
                </>
              )}
              {source === 'wardrobe' && ' · твои вещи'}
            </p>

            <div className="items">
              {items.map((item) => (
                <span key={item.id}>
                  {CATEGORY_EMOJI[item.category] ?? '✨'} {'name' in item ? item.name : item.brand || item.category}
                </span>
              ))}
            </div>

            {source === 'wardrobe' ? (
              <button
                type="button"
                className="try-button"
                onClick={() => navigate(`/avatar/tryon/${items[0].id}`)}
              >
                Посмотреть на манекене
              </button>
            ) : (
              <button type="button" className="try-button" onClick={() => navigate('/stylist/capsule')}>
                Смотреть в капсульном гардеробе
              </button>
            )}
          </div>
        </div>
      )}

      <div className="small-outfits">
        {CATEGORIES.map((c) => (
          <div
            key={c.key}
            role="button"
            tabIndex={0}
            onClick={() => handleCategoryChange(c.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleCategoryChange(c.key);
            }}
          >
            {c.label}
          </div>
        ))}
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { Chip } from '../components/ui/Chip';
import { HeartIcon } from '../components/ui/icons';
import { CAPSULE_ITEMS } from '../utils/capsuleData';
import { wildberriesSearchUrl } from '../utils/marketplaceLinks';
import { useCapsuleStore } from '../store/useCapsuleStore';
import type { WardrobeCategory } from '../types/wardrobe';

const CATEGORIES: (WardrobeCategory | 'Все')[] = ['Все', 'Верх', 'Низ', 'Платья', 'Обувь', 'Аксессуары'];

// Детерминированная "случайная" высота карточки по id — чтобы плитка
// выглядела как masonry, а не ровная сетка, но не прыгала при ре-рендере.
function cardHeight(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return 150 + (hash % 9) * 10; // 150..230
}

export function ShoppingScreen() {
  const [category, setCategory] = useState<(WardrobeCategory | 'Все')>('Все');
  const savedLookIds = useCapsuleStore((s) => s.savedLookIds);
  const toggleSave = useCapsuleStore((s) => s.toggleSave);

  const items = useMemo(
    () => (category === 'Все' ? CAPSULE_ITEMS : CAPSULE_ITEMS.filter((i) => i.category === category)),
    [category]
  );

  return (
    <div className="pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+110px)]">
      <h1 className="font-display text-[24px] text-ink px-6 mb-3">Шопинг</h1>

      <div className="flex gap-4 overflow-x-auto px-6 mb-4" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>

      <div className="px-3" style={{ columnCount: 2, columnGap: '8px' }}>
        {items.map((item) => {
          const saved = savedLookIds.includes(item.id);
          return (
            <a
              key={item.id}
              href={wildberriesSearchUrl(item.name)}
              target="_blank"
              rel="noreferrer"
              className="relative block mb-2 rounded-[14px] overflow-hidden"
              style={{
                height: cardHeight(item.id),
                breakInside: 'avoid',
                background: `linear-gradient(160deg, color-mix(in srgb, ${item.color} 55%, white), ${item.color})`,
              }}
            >
              <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-black/20 backdrop-blur px-2 py-1 rounded-full">
                {item.price.toLocaleString('ru-RU')} ₽
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSave(item.id);
                }}
                aria-label={saved ? 'Убрать из сохранённого' : 'Сохранить'}
                className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/70 backdrop-blur flex items-center justify-center"
              >
                <HeartIcon className={`w-3.5 h-3.5 ${saved ? 'text-pink' : 'text-ink'}`} filled={saved} />
              </button>
            </a>
          );
        })}
      </div>
    </div>
  );
}

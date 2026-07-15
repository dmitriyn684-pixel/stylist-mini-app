import { useState } from 'react';
import type { WardrobeCategory, WardrobeItem } from '../../types/wardrobe';

const CATEGORY_EMOJI: Record<WardrobeCategory, string> = {
  Верх: '👕',
  Низ: '👖',
  Платья: '👗',
  Обувь: '👟',
  Аксессуары: '👜',
};

const CATEGORIES: ('Все' | WardrobeCategory)[] = ['Все', 'Верх', 'Низ', 'Платья', 'Обувь', 'Аксессуары'];

const PREVIEW_LIMIT = 6;

interface AiWardrobeSectionProps {
  items: WardrobeItem[];
  onAddItem: () => void;
  onItemClick: (id: string) => void;
}

export function AiWardrobeSection({ items, onAddItem, onItemClick }: AiWardrobeSectionProps) {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>('Все');

  const filtered = active === 'Все' ? items : items.filter((i) => i.category === active);
  const visible = filtered.slice(0, PREVIEW_LIMIT);

  return (
    <section className="wardrobe-section">
      <div className="section-title">
        <div>
          <h2>Мой гардероб</h2>
          <p>AI знает твой стиль</p>
        </div>
        <button type="button" className="add-item" onClick={onAddItem} aria-label="Добавить вещь">
          ＋
        </button>
      </div>

      <div className="categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`category ${active === c ? 'active' : ''}`}
            onClick={() => setActive(c)}
          >
            {c === 'Все' ? 'Все' : CATEGORY_EMOJI[c]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-[13px] text-olive px-6 pb-4">
          {items.length === 0 ? 'Гардероб пока пуст — добавь первую вещь' : 'В этой категории пока пусто'}
        </p>
      ) : (
        <div className="clothes-grid">
          {visible.map((item) => (
            <button key={item.id} type="button" className="clothing-card" onClick={() => onItemClick(item.id)}>
              <div className="photo">
                <img src={item.imageUrl} alt={item.category} />
              </div>
              <div className="item-info">
                <h3>{item.brand || item.category}</h3>
                <span>
                  {item.categoryConfidence != null
                    ? `AI Match ${Math.round(item.categoryConfidence * 100)}%`
                    : 'Добавлено вручную'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

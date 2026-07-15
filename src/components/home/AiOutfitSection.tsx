import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarViewer } from '../avatar/AvatarViewer';
import { zoneByCategory } from '../../utils/mannequinZones';
import { CAPSULE_LOOKS, lookItems, lookTotalPrice } from '../../utils/capsuleData';
import { computeOutfitMatch } from '../../utils/outfitMatch';
import { useAvatarStore } from '../../store/useAvatarStore';
import { useColorAnalysis } from '../../hooks/useColorAnalysis';
import type { CapsuleStyle } from '../../types/capsule';
import type { MannequinHighlight } from '../avatar/ParametricMannequin';

// Только 3 стиля реально есть в capsuleData.ts (work/casual/evening) — не
// стал придумывать Travel/Sport/Luxury без данных под ними, честные ярлыки
// под существующие категории (те же, что в CapsuleWardrobeScreen).
const STYLE_TABS: { key: CapsuleStyle; label: string }[] = [
  { key: 'work', label: 'Business' },
  { key: 'casual', label: 'На каждый день' },
  { key: 'evening', label: 'На выход' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  Верх: '🤍',
  Низ: '👖',
  Платья: '👗',
  Обувь: '👠',
  Аксессуары: '👜',
};

// "Лук дня" — детерминированный выбор по дате, а не рандом при каждом
// рендере, чтобы в течение дня показывался один и тот же образ.
function dayIndex(length: number): number {
  return Math.floor(Date.now() / 86_400_000) % length;
}

export function AiOutfitSection() {
  const navigate = useNavigate();
  const measurements = useAvatarStore((s) => s.measurements);
  const { result: colorResult } = useColorAnalysis();

  const [style, setStyle] = useState<CapsuleStyle>('work');
  const looksForStyle = useMemo(() => CAPSULE_LOOKS.filter((l) => l.style === style), [style]);
  const [index, setIndex] = useState(() => dayIndex(looksForStyle.length));

  const look = looksForStyle[index % looksForStyle.length];
  const items = useMemo(() => lookItems(look), [look]);
  const total = useMemo(() => lookTotalPrice(look), [look]);
  const match = useMemo(() => computeOutfitMatch(items, colorResult?.palette ?? null), [items, colorResult]);

  const highlights = useMemo<MannequinHighlight[]>(() => {
    const result: MannequinHighlight[] = [];
    for (const item of items) {
      const zone = zoneByCategory[item.category];
      if (zone) result.push({ zone, color: item.color });
    }
    return result;
  }, [items]);

  const handleStyleChange = (key: CapsuleStyle) => {
    setStyle(key);
    const nextLooks = CAPSULE_LOOKS.filter((l) => l.style === key);
    setIndex(dayIndex(nextLooks.length));
  };

  const handleShuffle = () => {
    setIndex((i) => (i + 1) % looksForStyle.length);
  };

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
          <h3>{look.name}</h3>
          <p>
            {STYLE_TABS.find((t) => t.key === style)?.label} · {items.length} вещ{items.length === 1 ? 'ь' : 'ей'} · от{' '}
            {total.toLocaleString('ru-RU')} ₽
          </p>

          <div className="items">
            {items.map((item) => (
              <span key={item.id}>
                {CATEGORY_EMOJI[item.category] ?? '✨'} {item.name}
              </span>
            ))}
          </div>

          <button type="button" className="try-button" onClick={() => navigate('/stylist/capsule')}>
            Примерить образ
          </button>
        </div>
      </div>

      <div className="small-outfits">
        {STYLE_TABS.map((t) => (
          <div
            key={t.key}
            role="button"
            tabIndex={0}
            onClick={() => handleStyleChange(t.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleStyleChange(t.key);
            }}
          >
            {t.label}
          </div>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarViewer } from '../components/avatar/AvatarViewer';
import { useWardrobeStore } from '../store/useWardrobeStore';
import { useAvatarStore } from '../store/useAvatarStore';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { generateOutfitFromWardrobe } from '../utils/outfitGenerator';
import { CAPSULE_LOOKS, lookItems } from '../utils/capsuleData';
import { computeOutfitMatch } from '../utils/outfitMatch';
import { wildberriesSearchUrl } from '../utils/marketplaceLinks';
import { zoneByCategory } from '../utils/mannequinZones';
import { CheckIcon } from '../components/ui/icons';
import type { WardrobeItem } from '../types/wardrobe';
import type { CapsuleItem } from '../types/capsule';
import type { MannequinHighlight } from '../components/avatar/ParametricMannequin';

type Slot =
  | { source: 'wardrobe'; items: WardrobeItem[]; match: number | null }
  | { source: 'catalog'; items: CapsuleItem[]; match: number | null; lookName: string };

const STATUS_STEPS = [
  { label: 'Анализ гардероба', percent: 100 },
  { label: 'Подбор цветов', percent: 100 },
  { label: 'Поиск сочетаний', percent: 100 },
  { label: 'Создание образов', percent: 98 },
];

// Реального "AI ждёт" здесь нет — вся генерация уже посчитана на клиенте
// синхронно (см. slots ниже). Это намеренная пауза-хореография перед
// показом результата, ровно как просили в макете, а не имитация задержки
// внешнего сервиса.
const GENERATE_DELAY_MS = 3000;

function itemKey(ids: string[]): string {
  return [...ids].sort().join('|');
}

function itemLabel(item: WardrobeItem | CapsuleItem): string {
  return 'name' in item ? item.name : item.brand || item.category;
}

export function GenerateLookScreen() {
  const navigate = useNavigate();
  const wardrobeItems = useWardrobeStore((s) => s.items);
  const addOutfit = useWardrobeStore((s) => s.addOutfit);
  const measurements = useAvatarStore((s) => s.measurements);
  const { result: colorResult } = useColorAnalysis();
  const palette = colorResult?.palette ?? null;

  const [phase, setPhase] = useState<'generating' | 'results'>('generating');
  const [savedKeys, setSavedKeys] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setPhase('results'), GENERATE_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Сначала пробуем реальные комбинации из гардероба пользователя (та же
  // функция, что и в "Луках дня" на Главной), несколько разных вариантов
  // подряд, отбрасывая повторы. Если в гардеробе не хватает вещей на все
  // 3 — честно добираем из кураторского каталога капсульного гардероба,
  // а не дублируем один и тот же образ трижды.
  const slots = useMemo<Slot[]>(() => {
    const seen = new Set<string>();
    const wardrobeSlots: Slot[] = [];
    for (let variant = 0; variant < 8 && wardrobeSlots.length < 3; variant++) {
      const generated = generateOutfitFromWardrobe(wardrobeItems, palette, variant);
      if (!generated) break;
      const key = itemKey(generated.items.map((i) => i.id));
      if (seen.has(key)) continue;
      seen.add(key);
      wardrobeSlots.push({
        source: 'wardrobe',
        items: generated.items,
        match: computeOutfitMatch(generated.items, palette),
      });
    }

    const catalogSlots: Slot[] = [];
    for (let i = wardrobeSlots.length; i < 3; i++) {
      const look = CAPSULE_LOOKS[i % CAPSULE_LOOKS.length];
      const items = lookItems(look);
      catalogSlots.push({
        source: 'catalog',
        items,
        match: computeOutfitMatch(items, palette),
        lookName: look.name,
      });
    }

    return [...wardrobeSlots, ...catalogSlots];
  }, [wardrobeItems, palette]);

  const handleSave = (slot: Slot) => {
    if (slot.source !== 'wardrobe') return;
    const key = itemKey(slot.items.map((i) => i.id));
    if (savedKeys.includes(key)) return;
    addOutfit({ name: 'AI-образ', itemIds: slot.items.map((i) => i.id) });
    setSavedKeys((prev) => [...prev, key]);
  };

  const highlightsFor = (items: (WardrobeItem | CapsuleItem)[]): MannequinHighlight[] => {
    const result: MannequinHighlight[] = [];
    for (const item of items) {
      const zone = zoneByCategory[item.category];
      if (zone) result.push({ zone, color: item.color });
    }
    return result;
  };

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <button onClick={() => navigate(-1)} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>

      {phase === 'generating' ? (
        <>
          <div className="generate-header">
            <h2>Создание образа</h2>
            <p>AI анализирует гардероб, сезон и цветотип</p>
          </div>

          <div className="liquid-card generator-card">
            <div className="ai-generator">
              <div className="generator-ring" />
              <div className="generator-center">
                <div className="pulse-core" />
              </div>
            </div>

            <div className="generator-status">
              {STATUS_STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className="status-line fade-stagger"
                  style={{ animationDelay: `${i * 0.35}s` }}
                >
                  <span>{step.label}</span>
                  <b>{step.percent}%</b>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="generate-header">
            <h2>Твои образы готовы</h2>
            <p>AI подобрал {slots.length} образа под твой стиль</p>
          </div>

          <div className="flex flex-col gap-4">
            {slots.map((slot, i) => {
              const key = itemKey(slot.items.map((it) => it.id));
              const saved = slot.source === 'wardrobe' && savedKeys.includes(key);

              return (
                <div key={key || i} className="outfit-card liquid-card fade-card">
                  <div className="outfit-image">
                    {measurements ? (
                      <AvatarViewer measurements={measurements} highlights={highlightsFor(slot.items)} />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center gap-3"
                        style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
                      >
                        {slot.items.map((it, itemI) => (
                          <span
                            key={itemI}
                            className="w-10 h-10 rounded-full border border-white/60"
                            style={{ background: it.color }}
                          />
                        ))}
                      </div>
                    )}
                    {slot.match !== null && <div className="match">{slot.match}% Match</div>}
                  </div>

                  <div className="outfit-info">
                    <h3>{slot.source === 'wardrobe' ? `Образ ${i + 1}` : slot.lookName}</h3>
                    <p>{slot.source === 'wardrobe' ? 'Из твоего гардероба' : 'Из капсульного гардероба'}</p>

                    <div className="items">
                      {slot.items.map((it, itemI) => (
                        <span key={itemI}>{itemLabel(it)}</span>
                      ))}
                    </div>

                    {slot.source === 'wardrobe' ? (
                      <>
                        <button type="button" className="try-button" onClick={() => handleSave(slot)} disabled={saved}>
                          {saved ? (
                            <span className="inline-flex items-center gap-1.5 justify-center">
                              <CheckIcon className="w-4 h-4" /> Сохранено
                            </span>
                          ) : (
                            'Сохранить'
                          )}
                        </button>
                        <button
                          type="button"
                          className="text-link"
                          onClick={() => navigate(`/avatar/tryon/${slot.items[0].id}`)}
                        >
                          Примерить
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          className="buy-btn block w-full text-center"
                          href={wildberriesSearchUrl(slot.items[0]?.name ?? slot.lookName)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Купить
                        </a>
                        <button type="button" className="text-link" onClick={() => navigate('/stylist/capsule')}>
                          Смотреть в капсульном гардеробе
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

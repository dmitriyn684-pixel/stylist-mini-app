import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '../components/ui/Chip';
import { LookCard } from '../components/capsule/LookCard';
import { useAvatarStore } from '../store/useAvatarStore';
import { useCapsuleStore } from '../store/useCapsuleStore';
import { CAPSULE_LOOKS, lookTotalPrice } from '../utils/capsuleData';
import type { BudgetTier, CapsuleStyle } from '../types/capsule';

const styleTabs: { key: CapsuleStyle; label: string }[] = [
  { key: 'work', label: 'На работу' },
  { key: 'casual', label: 'На каждый день' },
  { key: 'evening', label: 'На выход' },
];

const budgetTiers: { key: BudgetTier; label: string; max: number | null }[] = [
  { key: 'econom', label: 'Эконом · до 10 000 ₽', max: 10000 },
  { key: 'optimal', label: 'Оптимум · до 30 000 ₽', max: 30000 },
  { key: 'premium', label: 'Премиум · без лимита', max: null },
];

export function CapsuleWardrobeScreen() {
  const navigate = useNavigate();
  const measurements = useAvatarStore((s) => s.measurements);
  const { savedLookIds, toggleSave } = useCapsuleStore();

  const [style, setStyle] = useState<CapsuleStyle>('work');
  const [budget, setBudget] = useState<BudgetTier>('optimal');

  const tier = budgetTiers.find((b) => b.key === budget)!;

  const looks = useMemo(
    () =>
      CAPSULE_LOOKS.filter((l) => l.style === style).filter((l) => (tier.max === null ? true : lookTotalPrice(l) <= tier.max)),
    [style, tier]
  );

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+110px)]">
      <button onClick={() => navigate('/stylist')} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>
      <h1 className="font-display text-[26px] text-ink mb-1">Капсульный гардероб</h1>
      <p className="text-[13px] text-olive mb-5">
        Примерные цены и подборки — не живые данные с маркетплейсов. Кнопки «Купить» ведут на реальный поиск по названию вещи.
      </p>

      <p className="text-[13px] font-bold text-ink mb-2">Бюджет</p>
      <div className="flex flex-col gap-2 mb-5">
        {budgetTiers.map((b) => (
          <button
            key={b.key}
            onClick={() => setBudget(b.key)}
            className={`text-left rounded-xl px-4 py-2.5 text-[13px] font-semibold border ${
              budget === b.key ? 'bg-ink text-cream border-ink' : 'bg-card text-ink-soft border-ink/10'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 mb-5 -mx-6 px-6 overflow-x-auto">
        {styleTabs.map((t) => (
          <Chip key={t.key} label={t.label} active={style === t.key} onClick={() => setStyle(t.key)} />
        ))}
      </div>

      {looks.length === 0 ? (
        <p className="text-center text-[13px] text-olive py-12">В этом бюджете для этого стиля пока нет подборок — попробуй увеличить бюджет.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {looks.map((look) => (
            <LookCard
              key={look.id}
              look={look}
              measurements={measurements}
              saved={savedLookIds.includes(look.id)}
              onToggleSave={() => toggleSave(look.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

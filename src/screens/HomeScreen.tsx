import { useNavigate } from 'react-router-dom';
import { HeroStats } from '../components/home/HeroStats';
import { AiAnalyzerSection } from '../components/home/AiAnalyzerSection';
import { CategoryBars } from '../components/home/CategoryBars';
import { DayLookCard } from '../components/home/DayLookCard';
import { QuickActions } from '../components/home/QuickActions';
import { ChallengeCard } from '../components/home/ChallengeCard';
import { useTelegram } from '../hooks/useTelegram';
import { useUserProfile } from '../hooks/useUserProfile';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { useWardrobeStore } from '../store/useWardrobeStore';
import { mockChallenge, mockQuickActions } from '../utils/mockData';

const CATEGORY_COLORS: Record<string, string> = {
  Верх: 'var(--color-lavender)',
  Низ: 'var(--color-blue)',
  Обувь: 'var(--color-pink)',
};

export function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { profile, hasProfile } = useUserProfile();
  const { result: colorResult } = useColorAnalysis();
  const items = useWardrobeStore((s) => s.items);
  const outfits = useWardrobeStore((s) => s.outfits);

  const name = profile?.name || user.first_name || 'Гость';

  // Ничего не пришло из бота и гардероб пуст — честный empty-state вместо
  // demo-цифр (47 вещей и т.п.), которые раньше показывались всегда.
  if (!hasProfile && !colorResult && items.length === 0) {
    return (
      <div className="px-6 pt-[calc(env(safe-area-inset-top)+60px)] pb-[calc(env(safe-area-inset-bottom)+110px)] flex flex-col items-center text-center gap-4">
        <h1 className="font-display text-[22px] text-ink">Привет, {name}!</h1>
        <p className="text-[14px] text-ink-soft leading-relaxed max-w-[280px]">
          Пройди анализ в боте @StylistDimkoFF, чтобы увидеть здесь свой цветотип, тип фигуры и персональные
          рекомендации.
        </p>
      </div>
    );
  }

  const totalItems = items.length;
  const totalOutfits = outfits.length;
  const readyPercent =
    totalItems > 0 ? Math.round((items.filter((i) => i.timesWorn > 0).length / totalItems) * 100) : 0;

  const categoryBars = (['Верх', 'Низ', 'Обувь'] as const).map((label) => ({
    label,
    value: items.filter((it) => it.category === label).length,
    max: Math.max(totalItems, 1),
    color: CATEGORY_COLORS[label],
  }));

  const dayLook = colorResult?.seasonalType
    ? {
        title: 'Твой цветотип определён',
        tip: `Твой цветотип — ${colorResult.seasonalType}. Загляни в «Стилист», там палитра и рекомендации.`,
      }
    : {
        title: 'Образ дня',
        tip: 'Пройди анализ в боте, чтобы получать персональные рекомендации по образам.',
      };

  return (
    <div className="app">
      <HeroStats
        name={name}
        totalItems={totalItems}
        totalOutfits={totalOutfits}
        readyPercent={readyPercent}
        onProfileClick={() => navigate('/profile')}
        onOpenStylist={() => navigate('/stylist')}
      />

      <AiAnalyzerSection />

      <div className="px-6 flex flex-col gap-4">
        <CategoryBars bars={categoryBars} />
        <DayLookCard {...dayLook} onSeeMore={() => navigate('/stylist')} />
        <QuickActions actions={mockQuickActions} />
        <ChallengeCard {...mockChallenge} />
      </div>
    </div>
  );
}

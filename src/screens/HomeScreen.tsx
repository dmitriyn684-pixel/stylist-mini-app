import { useNavigate } from 'react-router-dom';
import homeEmptyHero from '../assets/home-empty-hero.jpg';
import { HeroStats } from '../components/home/HeroStats';
import { AiAnalyzerSection } from '../components/home/AiAnalyzerSection';
import { AiOutfitSection } from '../components/home/AiOutfitSection';
import { AiShoppingSection } from '../components/home/AiShoppingSection';
import { AiPassportSection } from '../components/home/AiPassportSection';
import { CategoryBars } from '../components/home/CategoryBars';
import { QuickActions } from '../components/home/QuickActions';
import { ChallengeCard } from '../components/home/ChallengeCard';
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
  const { profile, hasProfile } = useUserProfile();
  const { result: colorResult } = useColorAnalysis();
  const items = useWardrobeStore((s) => s.items);

  // Имя показываем только если пользователь реально указал его в анкете
  // бота — никаких Telegram first_name или заглушек вроде "Гость": в браузере
  // вне Telegram first_name — это моковое "Аня" (см. useTelegram.ts), и
  // показывать его как будто мы знаем имя пользователя нечестно.
  const name = profile?.name ?? null;

  // Ничего не пришло из бота и гардероб пуст — честный empty-state вместо
  // demo-цифр (47 вещей и т.п.), которые раньше показывались всегда.
  if (!hasProfile && !colorResult && items.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <img src={homeEmptyHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        {/* Тёмный градиент снизу — фото остаётся ярким сверху, текст читаем снизу,
            тот же паттерн, что в OnboardingScreen.tsx. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,15,12,.15) 0%, rgba(20,15,12,.05) 25%, rgba(20,15,12,.55) 65%, rgba(20,15,12,.88) 100%)',
          }}
        />

        <div className="relative px-6 pt-[calc(env(safe-area-inset-top)+60px)] pb-[calc(env(safe-area-inset-bottom)+110px)] flex flex-col items-center text-center gap-4">
          <h1 className="font-display text-[22px] text-white drop-shadow-sm">
            {name ? `Привет, ${name}!` : 'Привет!'}
          </h1>
          <p className="text-[14px] text-white/90 leading-relaxed max-w-[280px]">
            Пройди анализ в боте @StylistDimkoFF, чтобы увидеть здесь свой цветотип, тип фигуры и персональные
            рекомендации.
          </p>
        </div>
      </div>
    );
  }

  const totalItems = items.length;

  const categoryBars = (['Верх', 'Низ', 'Обувь'] as const).map((label) => ({
    label,
    value: items.filter((it) => it.category === label).length,
    max: Math.max(totalItems, 1),
    color: CATEGORY_COLORS[label],
  }));

  return (
    <div className="app">
      <HeroStats
        name={name}
        onProfileClick={() => navigate('/profile')}
        onCreateLook={() => navigate('/wardrobe/outfits/generate')}
      />

      <AiAnalyzerSection />

      <AiOutfitSection />

      <AiShoppingSection />

      <AiPassportSection />

      <div className="px-6 flex flex-col gap-4">
        <CategoryBars bars={categoryBars} />
        <QuickActions actions={mockQuickActions} />
        <ChallengeCard {...mockChallenge} />
      </div>
    </div>
  );
}

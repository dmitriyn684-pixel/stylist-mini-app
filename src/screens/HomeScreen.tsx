import { HeroStats } from '../components/home/HeroStats';
import { CategoryBars } from '../components/home/CategoryBars';
import { DayLookCard } from '../components/home/DayLookCard';
import { QuickActions } from '../components/home/QuickActions';
import { ChallengeCard } from '../components/home/ChallengeCard';
import { AmbassadorsScroll } from '../components/home/AmbassadorsScroll';
import {
  mockUser,
  mockWardrobeStats,
  mockCategoryBars,
  mockDayLook,
  mockChallenge,
  mockAmbassadors,
  mockQuickActions,
} from '../utils/mockData';

export function HomeScreen() {
  return (
    <div className="pb-[calc(env(safe-area-inset-bottom)+110px)]">
      <HeroStats
        name={mockUser.name}
        totalItems={mockWardrobeStats.totalItems}
        totalOutfits={mockWardrobeStats.totalOutfits}
        readyPercent={mockWardrobeStats.readyPercent}
      />

      <div className="px-6 -mt-4 flex flex-col gap-4">
        <CategoryBars bars={mockCategoryBars} />
        <DayLookCard {...mockDayLook} />
        <QuickActions actions={mockQuickActions} />
        <ChallengeCard {...mockChallenge} />
        <AmbassadorsScroll ambassadors={mockAmbassadors} />
      </div>
    </div>
  );
}

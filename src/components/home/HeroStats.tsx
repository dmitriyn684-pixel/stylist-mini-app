import { ChevronDownIcon, ProfileIcon } from '../ui/icons';

interface HeroStatsProps {
  name: string;
  totalItems: number;
  totalOutfits: number;
  readyPercent: number;
  onProfileClick?: () => void;
}

export function HeroStats({ name, totalItems, totalOutfits, readyPercent, onProfileClick }: HeroStatsProps) {
  const today = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date());

  return (
    <div className="relative overflow-hidden shimmer-bg px-6 pt-[calc(env(safe-area-inset-top)+18px)] pb-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8 text-white">
        <p className="font-display text-[22px]">Доброе утро, {name}</p>
        <button
          onClick={onProfileClick}
          className="pulse-glow w-9 h-9 rounded-full bg-white/25 backdrop-blur flex items-center justify-center"
          aria-label="Профиль"
        >
          <ProfileIcon className="w-5 h-5" />
        </button>
      </div>

      {/* AI Core + боковые метрики */}
      <div className="flex items-center justify-center gap-6 text-white">
        <div className="text-center">
          <p className="text-2xl font-bold leading-none">{totalItems}</p>
          <p className="text-[10px] font-semibold tracking-[0.14em] mt-1 opacity-90">ВЕЩЕЙ</p>
        </div>

        <div className="ai-core">
          <div className="ai-core-inner">
            <p className="text-4xl font-bold leading-none">{readyPercent}%</p>
            <p className="text-[9px] font-semibold tracking-[0.12em] mt-1.5 opacity-90 text-center px-3">
              ГАРДЕРОБ РАЗОБРАН
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold leading-none">{totalOutfits}</p>
          <p className="text-[10px] font-semibold tracking-[0.14em] mt-1 opacity-90">ЛУКОВ</p>
        </div>
      </div>

      <button className="mx-auto mt-6 flex items-center gap-1 text-[11px] font-bold tracking-[0.14em] text-white/95">
        SEE STATS
        <ChevronDownIcon className="w-3.5 h-3.5" />
      </button>
      <p className="text-center text-[12px] text-white/80 font-medium mt-5 capitalize">Сегодня, {today}</p>
    </div>
  );
}

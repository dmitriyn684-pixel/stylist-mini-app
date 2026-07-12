import { ChevronDownIcon, ProfileIcon } from '../ui/icons';

interface HeroStatsProps {
  name: string;
  totalItems: number;
  totalOutfits: number;
  readyPercent: number;
}

export function HeroStats({ name, totalItems, totalOutfits, readyPercent }: HeroStatsProps) {
  const today = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date());

  return (
    <div className="relative overflow-hidden shimmer-bg px-6 pt-[calc(env(safe-area-inset-top)+18px)] pb-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8 text-white">
        <p className="font-display text-[22px]">Доброе утро, {name}</p>
        <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur flex items-center justify-center">
          <ProfileIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Кольцо + боковые метрики */}
      <div className="flex items-center justify-center gap-6 text-white">
        <div className="text-center">
          <p className="text-2xl font-bold leading-none">{totalItems}</p>
          <p className="text-[10px] font-semibold tracking-[0.14em] mt-1 opacity-90">ВЕЩЕЙ</p>
        </div>

        <div className="w-36 h-36 rounded-full border-2 border-white/80 flex flex-col items-center justify-center shrink-0">
          <p className="text-5xl font-bold leading-none">{readyPercent}%</p>
          <p className="text-[10px] font-semibold tracking-[0.14em] mt-2 opacity-90 text-center px-2">
            ГАРДЕРОБ РАЗОБРАН
          </p>
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

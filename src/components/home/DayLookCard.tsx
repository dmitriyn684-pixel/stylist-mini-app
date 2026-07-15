import { ArrowRightIcon, SparkleIcon } from '../ui/icons';

interface DayLookCardProps {
  title: string;
  tip: string;
  onSeeMore?: () => void;
}

export function DayLookCard({ title, tip, onSeeMore }: DayLookCardProps) {
  return (
    <div className="shimmer-border bg-card rounded-2xl shadow-card p-6 flex flex-col items-center text-center gap-3">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-pink-light), var(--color-pink))' }}
      >
        <SparkleIcon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-display text-[20px] text-ink">{title}</h3>
      <p className="text-[13px] text-ink-soft leading-relaxed max-w-[280px]">{tip}</p>
      <button
        onClick={onSeeMore}
        className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-lavender mt-1"
      >
        SEE MORE
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

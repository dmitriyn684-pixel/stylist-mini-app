import { Button } from '../ui/Button';
import { FlameIcon } from '../ui/icons';

interface ChallengeCardProps {
  title: string;
}

export function ChallengeCard({ title }: ChallengeCardProps) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: 'linear-gradient(120deg, var(--color-blue-light), var(--color-pink-light))' }}
    >
      <span className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center shrink-0">
        <FlameIcon className="w-5 h-5 text-ink" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold tracking-[0.1em] text-ink/70 mb-1">ЧЕЛЛЕНДЖ ДНЯ</p>
        <p className="text-[14px] font-semibold text-ink leading-snug">{title}</p>
      </div>
      <Button variant="primary" className="!px-4 !py-2.5 !text-[12px] shrink-0">
        Принять
      </Button>
    </div>
  );
}

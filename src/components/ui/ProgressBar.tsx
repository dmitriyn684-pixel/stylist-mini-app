interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

export function ProgressBar({ label, value, max, color }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-semibold text-ink-soft mb-2 truncate">{label}</p>
      <div className="h-[6px] rounded-full bg-cream-dark overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-[11px] text-olive mt-2 font-medium">{value} / {max}</p>
    </div>
  );
}

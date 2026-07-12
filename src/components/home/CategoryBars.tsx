import { ProgressBar } from '../ui/ProgressBar';

interface Bar {
  label: string;
  value: number;
  max: number;
  color: string;
}

export function CategoryBars({ bars }: { bars: Bar[] }) {
  return (
    <div className="bg-card rounded-2xl shadow-card p-5 flex gap-5">
      {bars.map((bar) => (
        <ProgressBar key={bar.label} {...bar} />
      ))}
    </div>
  );
}

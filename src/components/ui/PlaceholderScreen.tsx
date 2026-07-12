import type { ComponentType } from 'react';

interface PlaceholderScreenProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  note?: string;
}

export function PlaceholderScreen({ icon: Icon, title, note }: PlaceholderScreenProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-8 gap-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h2 className="font-display text-[22px] text-ink">{title}</h2>
      <p className="text-[13px] text-olive max-w-[240px]">{note ?? 'Экран в разработке — появится в следующем спринте.'}</p>
    </div>
  );
}

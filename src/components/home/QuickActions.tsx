import { Link } from 'react-router-dom';
import type { ComponentType } from 'react';

interface Action {
  key: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  to: string;
}

export function QuickActions({ actions }: { actions: Action[] }) {
  return (
    <div>
      <p className="text-[13px] font-bold text-ink mb-3">Быстрые действия</p>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.key}
            to={a.to}
            className="bg-card rounded-2xl shadow-card p-4 flex items-center gap-3 active:scale-[0.97] transition-transform"
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
            >
              <a.Icon className="w-4 h-4 text-white" />
            </span>
            <span className="text-[13px] font-semibold text-ink leading-tight">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

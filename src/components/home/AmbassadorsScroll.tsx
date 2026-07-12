interface Ambassador {
  name: string;
}

export function AmbassadorsScroll({ ambassadors }: { ambassadors: Ambassador[] }) {
  return (
    <div>
      <p className="text-[13px] font-bold text-ink mb-3">Блогеры</p>
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-6 px-6">
        {ambassadors.map((a) => (
          <div key={a.name} className="flex flex-col items-center gap-2 shrink-0">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-display text-[22px] text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-lavender), var(--color-pink))' }}
            >
              {a.name[0]}
            </div>
            <p className="text-[11px] font-semibold text-ink-soft">{a.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

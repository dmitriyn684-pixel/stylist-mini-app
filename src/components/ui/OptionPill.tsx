interface OptionPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  swatch?: string;
}

export function OptionPill({ label, active, onClick, swatch }: OptionPillProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold border transition-colors ${
        active ? 'bg-ink text-cream border-ink' : 'bg-card text-ink-soft border-ink/10'
      }`}
    >
      {swatch && (
        <span className="w-4 h-4 rounded-full border border-ink/10 shrink-0" style={{ background: swatch }} />
      )}
      {label}
    </button>
  );
}

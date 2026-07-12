interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'shrink-0 text-[14px] font-bold text-ink underline decoration-2 underline-offset-8 px-1 py-2'
          : 'shrink-0 text-[14px] font-medium text-olive px-1 py-2'
      }
    >
      {label}
    </button>
  );
}

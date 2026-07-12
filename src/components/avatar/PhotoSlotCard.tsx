import { useRef } from 'react';
import { CameraIcon, CheckIcon } from '../ui/icons';

interface PhotoSlotCardProps {
  title: string;
  hint: string;
  previewUrl: string | null;
  onSelect: (file: File) => void;
}

export function PhotoSlotCard({ title, hint, previewUrl, onSelect }: PhotoSlotCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="w-full flex items-center gap-4 bg-card rounded-2xl shadow-card p-4 text-left"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-cream-dark flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <CameraIcon className="w-6 h-6 text-olive" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-ink">{title}</p>
        <p className="text-[12px] text-olive leading-snug">{hint}</p>
      </div>
      <span
        className="text-[12px] font-semibold shrink-0 flex items-center gap-1"
        style={{ color: previewUrl ? 'var(--color-lavender)' : 'var(--color-olive)' }}
      >
        {previewUrl ? (
          <>
            Готово <CheckIcon className="w-3.5 h-3.5" />
          </>
        ) : (
          'Загрузить'
        )}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = '';
        }}
      />
    </button>
  );
}

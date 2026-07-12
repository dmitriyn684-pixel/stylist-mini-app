import { useState } from 'react';
import { ArrowRightIcon, MoonIcon } from '../ui/icons';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  limitReached: boolean;
}

export function ChatInput({ onSend, disabled, limitReached }: ChatInputProps) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  if (limitReached) {
    return (
      <div className="border-t border-ink/10 bg-cream px-4 py-4 text-center flex flex-col items-center gap-1.5">
        <MoonIcon className="w-5 h-5 text-lavender" />
        <p className="text-[13px] text-olive">Бесплатные сообщения на сегодня закончились — возвращайся завтра</p>
      </div>
    );
  }

  return (
    <div className="border-t border-ink/10 bg-cream px-4 py-3 flex items-center gap-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Спроси стилиста..."
        disabled={disabled}
        className="flex-1 bg-card rounded-full px-4 py-2.5 text-[14px] outline-none border border-ink/10 disabled:opacity-60"
      />
      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="w-10 h-10 rounded-full bg-lavender text-white flex items-center justify-center disabled:opacity-40 shrink-0"
      >
        <ArrowRightIcon className="w-4 h-4 -rotate-45" />
      </button>
    </div>
  );
}

import { useState } from 'react';
import { ArrowRightIcon, MoonIcon, CameraIcon } from '../ui/icons';

interface ChatInputProps {
  onSend: (text: string) => void;
  onPhotoClick: () => void;
  disabled: boolean;
  limitReached: boolean;
}

export function ChatInput({ onSend, onPhotoClick, disabled, limitReached }: ChatInputProps) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  if (limitReached) {
    return (
      <div className="shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 text-center flex flex-col items-center gap-1.5">
        <MoonIcon className="w-5 h-5 text-lavender" />
        <p className="text-[13px] text-olive">Бесплатные сообщения на сегодня закончились — возвращайся завтра</p>
      </div>
    );
  }

  return (
    <div className="shrink-0 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2">
      <div className="chat-input">
        <button type="button" className="photo-btn" onClick={onPhotoClick} disabled={disabled} aria-label="Прикрепить фото">
          <CameraIcon className="w-5 h-5" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Написать стилисту..."
          disabled={disabled}
          className="input-box"
        />
        <button
          type="button"
          className="send-btn"
          onClick={submit}
          disabled={disabled || !text.trim()}
          aria-label="Отправить"
        >
          <ArrowRightIcon className="w-4 h-4 mx-auto" />
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ArrowRightIcon, MoonIcon, CameraIcon } from '../ui/icons';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  onPhotoClick: () => void;
  disabled: boolean;
  limitReached: boolean;
  autoFocus?: boolean;
}

export function ChatInput({ onSend, onPhotoClick, disabled, limitReached, autoFocus = false }: ChatInputProps) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  if (limitReached) {
    return (
      <div className={styles.limitNotice}>
        <MoonIcon className={styles.limitIcon} />
        <p>Бесплатные сообщения на сегодня закончились — возвращайся завтра</p>
      </div>
    );
  }

  return (
    <div className={styles.composerArea}>
      <div className={styles.composer}>
        <button
          type="button"
          className={styles.photoButton}
          onClick={onPhotoClick}
          disabled={disabled}
          aria-label="Прикрепить фото"
        >
          <CameraIcon className={styles.cameraIcon} />
        </button>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
          placeholder="Написать стилисту..."
          disabled={disabled}
          autoFocus={autoFocus}
          className={styles.input}
        />
        <button
          type="button"
          className={styles.sendButton}
          onClick={submit}
          disabled={disabled || !text.trim()}
          aria-label="Отправить"
        >
          <ArrowRightIcon className={styles.sendIcon} />
        </button>
      </div>
    </div>
  );
}

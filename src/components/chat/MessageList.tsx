import type { ReactNode } from 'react';
import type { ChatMessage } from '../../types/chat';
import { PaletteMessage } from './PaletteMessage';
import styles from './MessageList.module.css';

function TypingDots() {
  return (
    <span className={styles.typingDots} aria-label="Стилист печатает">
      {[0, 1, 2].map((index) => (
        <span key={index} style={{ animationDelay: `${index * 0.16}s` }} />
      ))}
    </span>
  );
}

function renderInlineMarkdown(value: string): ReactNode[] {
  return value.split(/(\*\*[^*\n]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part.replaceAll('**', '');
  });
}

function RichMessageText({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const blocks: ReactNode[] = [];

  for (let index = 0; index < lines.length; ) {
    const bulletMatch = lines[index].match(/^\s*[-•*]\s+(.+)$/);
    const orderedMatch = lines[index].match(/^\s*\d+[.)]\s+(.+)$/);

    if (bulletMatch) {
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const match = lines[index].match(/^\s*[-•*]\s+(.+)$/);
        if (!match) break;
        items.push(<li key={index}>{renderInlineMarkdown(match[1])}</li>);
        index += 1;
      }
      blocks.push(<ul key={`list-${index}`}>{items}</ul>);
      continue;
    }

    if (orderedMatch) {
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const match = lines[index].match(/^\s*\d+[.)]\s+(.+)$/);
        if (!match) break;
        items.push(<li key={index}>{renderInlineMarkdown(match[1])}</li>);
        index += 1;
      }
      blocks.push(<ol key={`ordered-${index}`}>{items}</ol>);
      continue;
    }

    if (lines[index].trim()) {
      blocks.push(<p key={index}>{renderInlineMarkdown(lines[index])}</p>);
    } else {
      blocks.push(<span key={index} className={styles.textSpacer} aria-hidden="true" />);
    }
    index += 1;
  }

  return <div className={styles.messageText}>{blocks}</div>;
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <>
      {messages.map((message) => {
        const classNames = [
          styles.message,
          message.role === 'user' ? styles.userMessage : styles.aiMessage,
          message.error ? styles.errorMessage : '',
          message.kind === 'note' ? styles.noteMessage : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={message.id} className={classNames}>
            {message.kind === 'palette' && message.palette ? (
              <PaletteMessage palette={message.palette} />
            ) : message.streaming && !message.content ? (
              <TypingDots />
            ) : (
              <RichMessageText text={message.content} />
            )}
          </div>
        );
      })}
    </>
  );
}

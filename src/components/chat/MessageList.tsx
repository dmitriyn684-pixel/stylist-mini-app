import type { ChatMessage } from '../../types/chat';
import { PaletteMessage } from './PaletteMessage';

function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-olive animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <>
      {messages.map((m) => (
        <div
          key={m.id}
          className={`message whitespace-pre-wrap ${m.role === 'user' ? 'user-message' : 'ai-message'} ${
            m.error ? '!bg-error/10 !text-error' : ''
          } ${m.kind === 'note' ? 'text-ink-soft italic' : 'text-ink'}`}
        >
          {m.kind === 'palette' && m.palette ? (
            <PaletteMessage palette={m.palette} />
          ) : m.streaming && !m.content ? (
            <TypingDots />
          ) : (
            m.content
          )}
        </div>
      ))}
    </>
  );
}

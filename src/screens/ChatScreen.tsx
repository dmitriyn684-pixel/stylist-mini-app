import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatIcon } from '../components/ui/icons';
import { useChatStore } from '../store/useChatStore';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { useAvatarStore } from '../store/useAvatarStore';
import { useWardrobeStore } from '../store/useWardrobeStore';
import type { ChatProfile } from '../types/chat';

export function ChatScreen() {
  const navigate = useNavigate();
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const addPaletteMessage = useChatStore((s) => s.addPaletteMessage);
  const remaining = useChatStore((s) => s.remaining());

  const { result: colorResult } = useColorAnalysis();
  const measurements = useAvatarStore((s) => s.measurements);
  const kibbeResult = useAvatarStore((s) => s.kibbeResult);
  const items = useWardrobeStore((s) => s.items);

  const profile: ChatProfile = useMemo(
    () => ({
      seasonalType: colorResult?.seasonalType ?? null,
      kibbeType: kibbeResult?.type ?? colorResult?.kibbeType ?? null,
      measurements: measurements ?? null,
      wardrobe: items.map((i) => ({ category: i.category, color: i.color })),
      palette: colorResult?.palette ?? null,
    }),
    [colorResult, kibbeResult, measurements, items]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-cream">
      <div className="flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-3 border-b border-ink/10 shrink-0">
        <button onClick={() => navigate(-1)} className="text-[13px] font-semibold text-olive">
          ← Назад
        </button>
        <div className="flex items-center gap-2">
          <ChatIcon className="w-4 h-4 text-lavender" />
          <div>
            <p className="text-[14px] font-bold text-ink">AI-стилист</p>
            <p className="text-[11px] text-olive">Осталось сегодня: {Number.isFinite(remaining) ? remaining : '∞ (Premium)'}</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-[13px] text-olive mt-10 px-6 leading-relaxed">
            Привет! Спроси меня про образ, гардероб или что надеть — я знаю твой цветотип, тип фигуры и вещи в шкафу.
          </p>
        )}
        <MessageList messages={messages} />
      </div>

      {colorResult?.palette && (
        <div className="px-4 pb-2 shrink-0">
          <button
            onClick={() => addPaletteMessage(colorResult.palette)}
            className="text-[12px] font-semibold text-lavender flex items-center gap-1"
          >
            🎨 Показать мою палитру
          </button>
        </div>
      )}

      <ChatInput onSend={(text) => sendMessage(text, profile)} disabled={isTyping || remaining <= 0} limitReached={remaining <= 0} />
    </div>
  );
}

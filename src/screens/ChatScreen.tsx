import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { useChatStore } from '../store/useChatStore';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { useTelegram } from '../hooks/useTelegram';
import { useAdminChatAccess } from '../hooks/useAdminChatAccess';
import { useAvatarStore } from '../store/useAvatarStore';
import { useWardrobeStore } from '../store/useWardrobeStore';
import { SparkleIcon, PaletteIcon } from '../components/ui/icons';
import type { ChatProfile } from '../types/chat';

const QUICK_ACTIONS = [
  { label: 'Весенний образ', prompt: 'Помоги подобрать весенний образ' },
  { label: 'На работу', prompt: 'Помоги подобрать образ на работу' },
  { label: 'Свидание', prompt: 'Помоги подобрать образ на свидание' },
];

export function ChatScreen() {
  const navigate = useNavigate();
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const addPaletteMessage = useChatStore((s) => s.addPaletteMessage);
  const addNote = useChatStore((s) => s.addNote);
  const remaining = useChatStore((s) => s.remaining());
  const isUnlimitedAdmin = useChatStore((s) => s.isUnlimited);

  const { user } = useTelegram();
  useAdminChatAccess(user.id);

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

  const disabled = isTyping || remaining <= 0;

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // В чате нет реального анализа фото (бэкенд чата — только текст, DeepSeek
  // без vision) — вместо того чтобы делать вид, что фото учтено, честно
  // подсказываем, где оно реально работает (Часть 4, сканер на Главной).
  const handlePhotoClick = () => fileInputRef.current?.click();
  const handlePhotoSelected = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    addNote('Пока не умею разбирать фото прямо в чате — загляни в «AI Анализ» на Главной, там реальный AI-сканер фото.');
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      <button
        onClick={() => navigate(-1)}
        className="shrink-0 text-[13px] font-semibold text-olive px-4 pt-[calc(env(safe-area-inset-top)+16px)] text-left"
      >
        ← Назад
      </button>

      <div className="chat-header shrink-0">
        <div className="stylist-avatar">
          <SparkleIcon className="w-6 h-6" />
        </div>
        <div>
          <h2>DimkoFF AI</h2>
          <p>
            {Number.isFinite(remaining)
              ? `Осталось сегодня: ${remaining}`
              : isUnlimitedAdmin
                ? 'Безлимит · Admin'
                : 'Безлимит · Premium'}
          </p>
        </div>
        <div className="online-dot" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="chat-window">
          {messages.length === 0 && (
            <div className="message ai-message">
              Привет! Я твой AI стилист. Спроси меня про образ, гардероб или что надеть — я знаю твой цветотип,
              тип фигуры и вещи в шкафу.
            </div>
          )}
          <MessageList messages={messages} />
        </div>
      </div>

      <div className="quick-actions shrink-0">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            disabled={disabled}
            onClick={() => sendMessage(a.prompt, profile)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {colorResult?.palette && (
        <div className="px-6 pb-2 shrink-0">
          <button
            onClick={() => addPaletteMessage(colorResult.palette)}
            className="text-[12px] font-semibold text-lavender flex items-center gap-1"
          >
            <PaletteIcon className="w-3.5 h-3.5" /> Показать мою палитру
          </button>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelected} className="hidden" />

      <ChatInput
        onSend={(text) => sendMessage(text, profile)}
        onPhotoClick={handlePhotoClick}
        disabled={disabled}
        limitReached={remaining <= 0}
      />
    </div>
  );
}

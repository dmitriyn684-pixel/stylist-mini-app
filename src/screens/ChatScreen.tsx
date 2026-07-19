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
import type { ChatProfile } from '../types/chat';
import quickStylistHero from '../assets/editorial/stylist-chat-hero.jpg';
import styles from './ChatScreen.module.css';

export function ChatScreen() {
  const navigate = useNavigate();
  const messages = useChatStore((state) => state.messages);
  const isTyping = useChatStore((state) => state.isTyping);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const addNote = useChatStore((state) => state.addNote);
  const remaining = useChatStore((state) => state.remaining());
  const { user } = useTelegram();
  useAdminChatAccess(user.id);

  const { result: colorResult } = useColorAnalysis();
  const measurements = useAvatarStore((state) => state.measurements);
  const kibbeResult = useAvatarStore((state) => state.kibbeResult);
  const items = useWardrobeStore((state) => state.items);

  const profile: ChatProfile = useMemo(
    () => ({
      seasonalType: colorResult?.seasonalType ?? null,
      kibbeType: kibbeResult?.type ?? colorResult?.kibbeType ?? null,
      measurements: measurements ?? null,
      wardrobe: items.map((item) => ({ category: item.category, color: item.color })),
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

  // The text-only chat cannot inspect a photo, so the photo action points users
  // to the existing AI scanner without changing the established chat API.
  const handlePhotoClick = () => fileInputRef.current?.click();
  const handlePhotoSelected = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    addNote('Пока не умею разбирать фото прямо в чате — загляни в «AI Анализ» на Главной, там реальный AI-сканер фото.');
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-label="Private fashion concierge">
        <img src={quickStylistHero} alt="Fashion mannequins in an editorial display" className={styles.heroImage} />
        <div className={styles.heroWash} aria-hidden="true" />
        <div className={styles.heroSweep} aria-hidden="true" />
        <button type="button" onClick={() => navigate(-1)} className={styles.backButton}>
          <span aria-hidden="true">←</span>
          Назад
        </button>
      </section>

      <div className={styles.content}>
        <section className={styles.chatSection} aria-label="Диалог со стилистом">
          <div ref={scrollRef} className={styles.messageScroller}>
            <div className={styles.chatWindow}>
              {messages.length === 0 && (
                <div className={styles.welcomeMessage}>
                  Привет! Я твой AI-стилист. Спроси меня про образ, гардероб или что надеть — я знаю твой цветотип,
                  тип фигуры и вещи в шкафу.
                </div>
              )}
              <MessageList messages={messages} />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            className={styles.hiddenInput}
          />

          <ChatInput
            onSend={(text) => sendMessage(text, profile)}
            onPhotoClick={handlePhotoClick}
            disabled={disabled}
            limitReached={remaining <= 0}
          />
        </section>
      </div>
    </main>
  );
}

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { useChatStore } from '../store/useChatStore';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { useTelegram } from '../hooks/useTelegram';
import { useAdminChatAccess } from '../hooks/useAdminChatAccess';
import { useAvatarStore } from '../store/useAvatarStore';
import { useWardrobeStore } from '../store/useWardrobeStore';
import { CAPSULE_ITEMS } from '../utils/capsuleData';
import { DEFAULT_STYLIST_ID, getAIStylistById, type AIStylistId } from '../data/aiStylists';
import { useStylistStore } from '../store/useStylistStore';
import type { ChatProfile } from '../types/chat';
import styles from './ChatScreen.module.css';

interface ChatLocationState {
  selectedStylistId?: AIStylistId;
}

export function ChatScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeStylistId = (location.state as ChatLocationState | null)?.selectedStylistId;
  const selectedStylistId = useStylistStore((state) => state.selectedStylistId);
  const setSelectedStylist = useStylistStore((state) => state.setSelectedStylist);
  const currentStylist = getAIStylistById(selectedStylistId);
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
      wardrobe: items.map((item) => ({
        name: item.category,
        category: item.category,
        color: item.color,
        hex: item.color,
        seasons: item.season,
        material: item.fabric,
      })),
      catalog: CAPSULE_ITEMS.map((item) => ({
        name: item.name,
        category: item.category,
        color: item.color,
        price: item.price,
        styles: item.styles,
      })),
      palette: colorResult?.palette ?? null,
    }),
    [colorResult, kibbeResult, measurements, items]
  );

  const disabled = isTyping || remaining <= 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    setSelectedStylist(routeStylistId ?? DEFAULT_STYLIST_ID);
  }, [routeStylistId, setSelectedStylist]);

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
    <main className={`${styles.page} ${styles.quickPage}`}>
      <header className={styles.quickHeader}>
        <button type="button" onClick={() => navigate(-1)} className={styles.compactBackButton}>
          <span aria-hidden="true">←</span>
          Назад
        </button>
        <div className={styles.quickHeaderTitle}>
          <strong>{currentStylist.name}</strong>
          <small>{currentStylist.tag}</small>
        </div>
        <span className={styles.quickHeaderSpacer} aria-hidden="true" />
      </header>

      <div className={`${styles.content} ${styles.quickContent}`}>
        <section className={styles.chatSection} aria-label="Диалог со стилистом">
          <div ref={scrollRef} className={styles.messageScroller}>
            <div className={styles.chatWindow}>
              <div className={styles.activeStylistChip}>
                <span className={styles[`avatar_${currentStylist.id}`]}>{currentStylist.number}</span>
                {currentStylist.name} · {currentStylist.tag}
              </div>
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
            onSend={(text) => sendMessage(text, profile, selectedStylistId)}
            onPhotoClick={handlePhotoClick}
            disabled={disabled}
            limitReached={remaining <= 0}
          />
        </section>
      </div>
    </main>
  );
}

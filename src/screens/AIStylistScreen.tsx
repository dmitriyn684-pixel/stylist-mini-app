import { useEffect, useMemo, useRef, useState } from 'react';
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
import stylistCollectiveHero from '../assets/editorial/stylist-collective-hero.png';
import styles from './ChatScreen.module.css';

type StylistId = 'stylist1' | 'stylist2' | 'stylist3';

interface StylistPersona {
  id: StylistId;
  name: string;
  tag: string;
  monogram: string;
  avatar: string;
  description: string;
  chips: string[];
}

const STYLISTS: StylistPersona[] = [
  {
    id: 'stylist1',
    name: 'Stylist 1',
    tag: 'Luxury',
    monogram: '01',
    avatar: 'linear-gradient(145deg, #b8763b, #643e2d)',
    description: 'Описание стилиста будет добавлено позже.',
    chips: ['Luxury', 'Evening', 'Editorial'],
  },
  {
    id: 'stylist2',
    name: 'Stylist 2',
    tag: 'Minimal',
    monogram: '02',
    avatar: 'linear-gradient(145deg, #6f8582, #304f51)',
    description: 'Описание стилиста будет добавлено позже.',
    chips: ['Capsule', 'Minimal', 'Daily'],
  },
  {
    id: 'stylist3',
    name: 'Stylist 3',
    tag: 'Color / Body',
    monogram: '03',
    avatar: 'linear-gradient(145deg, #d0aa74, #755642)',
    description: 'Описание стилиста будет добавлено позже.',
    chips: ['Color', 'Shape', 'Proportions'],
  },
];

export function AIStylistScreen() {
  const navigate = useNavigate();
  const messages = useChatStore((state) => state.messages);
  const isTyping = useChatStore((state) => state.isTyping);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const addNote = useChatStore((state) => state.addNote);
  const remaining = useChatStore((state) => state.remaining());
  const [activeStylist, setActiveStylist] = useState<StylistId | null>(null);
  const [isDialogStarted, setIsDialogStarted] = useState(false);

  const currentStylist = activeStylist ? STYLISTS.find((stylist) => stylist.id === activeStylist) ?? null : null;

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
    if (!isDialogStarted) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isDialogStarted]);

  const handleStylistSelect = (id: StylistId) => {
    setActiveStylist(id);
    setIsDialogStarted(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDialogStart = () => {
    if (!currentStylist) return;
    setIsDialogStarted(true);
  };

  // В чате нет реального анализа фото: честно направляем к рабочему AI-сканеру.
  const handlePhotoClick = () => fileInputRef.current?.click();
  const handlePhotoSelected = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    addNote('Пока не умею разбирать фото прямо в чате — загляни в «AI Анализ» на Главной, там реальный AI-сканер фото.');
  };

  return (
    <main className={`${styles.page} ${styles.pageWithTabBar}`}>
      <section className={styles.hero} aria-label="Private fashion concierge">
        <img src={stylistCollectiveHero} alt="Three AI fashion stylist personas in a private atelier" className={styles.heroImage} />
        <div className={styles.heroWash} aria-hidden="true" />
        <div className={styles.heroSweep} aria-hidden="true" />
        <button type="button" onClick={() => navigate(-1)} className={styles.backButton}>
          <span aria-hidden="true">←</span>
          Назад
        </button>
      </section>

      <div className={styles.content}>
        <div className={styles.stylistSelector} aria-label="Выберите AI-стилиста">
          {STYLISTS.map((stylist) => {
            const isActive = stylist.id === activeStylist;
            return (
              <button
                key={stylist.id}
                type="button"
                className={`${styles.stylistOption} ${isActive ? styles.stylistOptionActive : ''}`}
                onClick={() => handleStylistSelect(stylist.id)}
                disabled={isTyping}
                aria-pressed={isActive}
                aria-label={`Выбрать ${stylist.name}`}
              >
                <span className={styles.selectorAvatar} style={{ background: stylist.avatar }}>
                  {stylist.monogram}
                </span>
                <strong>{stylist.name}</strong>
                <small>{stylist.tag}</small>
              </button>
            );
          })}
        </div>

        <section className={styles.chatSection} aria-label="Диалог со стилистом">
          <div ref={scrollRef} className={styles.messageScroller}>
            {!currentStylist ? (
              <div className={styles.selectionWelcome}>
                <span>AI stylist edit</span>
                <h1>Выберите свой подход к стилю</h1>
                <p>Три AI-персоны по-разному расставят акценты — от editorial luxury до точной работы с пропорциями.</p>
              </div>
            ) : !isDialogStarted ? (
              <article className={styles.introCard}>
                <span className={styles.introEyebrow}>Private AI stylist</span>
                <div className={styles.introHeader}>
                  <span className={styles.introAvatar} style={{ background: currentStylist.avatar }}>
                    {currentStylist.monogram}
                  </span>
                  <div>
                    <h1>{currentStylist.name}</h1>
                    <p>{currentStylist.tag}</p>
                  </div>
                </div>
                <p className={styles.introDescription}>{currentStylist.description}</p>
                <div className={styles.strengthList}>
                  {currentStylist.chips.map((strength) => (
                    <span key={strength}>{strength}</span>
                  ))}
                </div>
                <button type="button" className={styles.startButton} onClick={handleDialogStart}>
                  Начать диалог
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            ) : (
              <div className={styles.chatWindow}>
                <div className={styles.activeStylistChip}>
                  <span style={{ background: currentStylist.avatar }}>{currentStylist.monogram}</span>
                  {currentStylist.name} · online
                </div>
                <div className={styles.welcomeMessage}>
                  Готова начать. Опишите задачу или отправьте фото образа.
                </div>
                <MessageList messages={messages} />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            className={styles.hiddenInput}
          />

          {isDialogStarted && currentStylist && (
            <ChatInput
              onSend={(text) => sendMessage(text, profile)}
              onPhotoClick={handlePhotoClick}
              disabled={disabled}
              limitReached={remaining <= 0}
              autoFocus
            />
          )}
        </section>
      </div>
    </main>
  );
}

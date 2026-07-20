import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import stylistCollectiveHero from '../assets/editorial/stylist-collective-hero.png';
import { STYLISTS, useStylistStore, type StylistId } from '../store/useStylistStore';
import styles from './ChatScreen.module.css';

export function AIStylistScreen() {
  const navigate = useNavigate();
  const [activeStylist, setActiveStylist] = useState<StylistId | null>(null);
  const setSelectedStylist = useStylistStore((state) => state.setSelectedStylist);

  const currentStylist = activeStylist ? STYLISTS.find((stylist) => stylist.id === activeStylist) ?? null : null;

  const handleStylistSelect = (id: StylistId) => {
    setActiveStylist(id);
  };

  const handleDialogStart = () => {
    if (!currentStylist) return;
    setSelectedStylist(currentStylist.id);
    navigate('/chat', { state: { selectedStylistId: currentStylist.id } });
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

        <section className={styles.chatSection} aria-label="Выбор AI-стилиста">
          <div className={styles.messageScroller}>
            {!currentStylist ? (
              <div className={styles.selectionWelcome}>
                <span>AI stylist edit</span>
                <h1>Выберите свой подход к стилю</h1>
                <p>Три AI-персоны по-разному расставят акценты — от editorial luxury до точной работы с пропорциями.</p>
              </div>
            ) : (
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
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

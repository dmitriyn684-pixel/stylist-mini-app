import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import stylistCollectiveHero from '../assets/editorial/stylist-collective-hero.png';
import { STYLISTS, useStylistStore, type AIStylistId } from '../store/useStylistStore';
import styles from './ChatScreen.module.css';

export function AIStylistScreen() {
  const navigate = useNavigate();
  const [activeStylist, setActiveStylist] = useState<AIStylistId>('rachel');
  const setSelectedStylist = useStylistStore((state) => state.setSelectedStylist);

  const currentStylist = STYLISTS.find((stylist) => stylist.id === activeStylist) ?? STYLISTS[0];

  const handleStylistSelect = (id: AIStylistId) => {
    setActiveStylist(id);
    setSelectedStylist(id);
  };

  const handleDialogStart = () => {
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
            <article key={currentStylist.id} className={styles.introCard}>
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

              <p className={styles.previewLead}>{currentStylist.shortPreview}</p>

              <div className={styles.previewDetails}>
                <section className={styles.previewSection}>
                  <h2>Чем ценен разговор</h2>
                  <p>{currentStylist.value}</p>
                </section>
                <section className={styles.previewSection}>
                  <h2>Манера</h2>
                  <p>{currentStylist.manner}</p>
                </section>
                <section className={styles.previewSection}>
                  <h2>Роль в приложении</h2>
                  <p>{currentStylist.role}</p>
                </section>
              </div>

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
          </div>
        </section>
      </div>
    </main>
  );
}

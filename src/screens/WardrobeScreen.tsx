import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreIcon, PuzzleIcon, HangerIcon, SparkleIcon } from '../components/ui/icons';
import { useWardrobeStore } from '../store/useWardrobeStore';
import type { WardrobeCategory } from '../types/wardrobe';
import wardrobeEditorial from '../assets/editorial/wardrobe-editorial.jpg';
import styles from './WardrobeScreen.module.css';

const filters: ('Все' | WardrobeCategory)[] = ['Все', 'Верх', 'Низ', 'Платья', 'Обувь', 'Аксессуары'];

export function WardrobeScreen() {
  const navigate = useNavigate();
  const items = useWardrobeStore((s) => s.items);
  const [active, setActive] = useState<(typeof filters)[number]>('Все');

  const visible = active === 'Все' ? items : items.filter((i) => i.category === active);

  return (
    <main className={styles.page}>
      <section className={styles.heroCard} aria-label="Private wardrobe editorial">
        <img src={wardrobeEditorial} alt="Гардеробная с вечерними платьями" className={styles.heroImage} />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroAurora} aria-hidden="true" />
        <div className={styles.heroSweep} aria-hidden="true" />
      </section>

      <header className={styles.titleSection}>
        <h1>Гардероб</h1>
        <button type="button" onClick={() => navigate('/wardrobe/outfits')} className={styles.looksButton}>
          <PuzzleIcon />
          <span>Мои луки</span>
          <span aria-hidden="true">→</span>
        </button>
      </header>

      <section className={styles.tabsViewport} aria-label="Категории гардероба">
        <div className={styles.tabs}>
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles.tab} ${f === active ? styles.tabActive : ''}`}
              aria-pressed={f === active}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.aiCard} aria-labelledby="wardrobe-ai-title">
        <div className={styles.aiIcon} aria-hidden="true">
          <SparkleIcon />
        </div>

        <div className={styles.aiText}>
          <p id="wardrobe-ai-title" className={styles.aiTitle}>
            Сегодня AI рекомендует
          </p>
          <p className={styles.aiSubtitle}>Светлый верх + мягкий акцент в розовом оттенке</p>
        </div>

        <div className={styles.aiScore}>98%</div>
      </section>

      {visible.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <HangerIcon />
          </div>
          <p>
            {items.length === 0 ? 'Гардероб пока пуст — добавь первую вещь' : 'В этой категории пока пусто'}
          </p>
        </section>
      ) : (
        <section className={styles.itemsGrid} aria-label="Вещи в гардеробе">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/wardrobe/item/${item.id}`)}
              className={styles.itemCard}
            >
              <img src={item.imageUrl} alt={item.category} className={styles.itemImage} />
              <span className={styles.moreButton} aria-hidden="true">
                <MoreIcon />
              </span>
            </button>
          ))}
        </section>
      )}

      <div className={styles.addDock}>
        <button type="button" className={styles.addButton} onClick={() => navigate('/wardrobe/add')}>
          <span>+ Добавить вещь</span>
        </button>
      </div>
    </main>
  );
}

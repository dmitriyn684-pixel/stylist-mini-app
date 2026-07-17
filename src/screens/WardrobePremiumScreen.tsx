import { useMemo, useState } from 'react';
import { SparkleIcon, ArrowRightIcon } from '../components/ui/icons';
import { PremiumWardrobeCard } from '../components/wardrobe/PremiumWardrobeCard';
import wardrobeBanner from '../assets/wardrobe-banner.png';
import styles from './WardrobePremiumScreen.module.css';

type WardrobeCategory = 'all' | 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories';

type WardrobeItem = {
  id: string;
  title: string;
  category: WardrobeCategory;
  imageUrl?: string;
  match: number;
  quality?: 'good' | 'low';
};

const categories: Array<{ id: WardrobeCategory; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'tops', label: 'Верх' },
  { id: 'bottoms', label: 'Низ' },
  { id: 'dresses', label: 'Платья' },
  { id: 'shoes', label: 'Обувь' },
  { id: 'accessories', label: 'Аксессуары' },
];

function getCategoryLabel(category: WardrobeCategory): string {
  return categories.find((c) => c.id === category)?.label ?? '';
}

// Мок-данные для превью стиля. Позже заменим на items из useWardrobeStore.
const mockWardrobeItems: WardrobeItem[] = [
  { id: '1', title: 'Sport top', category: 'tops', match: 92, quality: 'good' },
  { id: '2', title: 'Pink textile', category: 'tops', match: 61, quality: 'low' },
  { id: '3', title: 'Lace set', category: 'dresses', match: 84, quality: 'good' },
  { id: '4', title: 'Evening look', category: 'dresses', match: 89, quality: 'good' },
];

export function WardrobePremiumScreen() {
  const [activeCategory, setActiveCategory] = useState<WardrobeCategory>('all');

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return mockWardrobeItems;
    return mockWardrobeItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <main className={styles.page}>
      <section className={styles.heroCard}>
        <img src={wardrobeBanner} alt="Premium wardrobe" className={styles.heroImage} />

        <div className={styles.heroBlobs}>
          <span />
          <span />
          <span />
        </div>

        <div className={styles.heroOverlay} />
      </section>

      <section className={styles.titleSection}>
        <div>
          <h2 className={styles.pageTitle}>Гардероб</h2>
          <p className={styles.pageSubtitle}>Твоя персональная fashion-база</p>
        </div>

        <button className={styles.looksButton} type="button">
          <SparkleIcon />
          <span>Мои луки</span>
          <ArrowRightIcon />
        </button>
      </section>

      <section className={styles.tabsWrapper}>
        <div className={styles.tabs}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${styles.tab} ${activeCategory === category.id ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.aiRecommendation}>
        <div className={styles.recommendationIcon}>
          <SparkleIcon />
        </div>

        <div className={styles.recommendationText}>
          <p className={styles.recommendationTitle}>Сегодня AI рекомендует</p>
          <p className={styles.recommendationSubtitle}>Светлый верх + мягкий акцент в розовом оттенке</p>
        </div>

        <div className={styles.recommendationScore}>98%</div>
      </section>

      <section className={styles.itemsSection}>
        <div className={styles.sectionHeader}>
          <h3>Мои вещи</h3>
          <span>{filteredItems.length}</span>
        </div>

        <div className={styles.grid}>
          {filteredItems.map((item, index) => (
            <PremiumWardrobeCard
              key={item.id}
              index={index + 1}
              title={item.title}
              imageUrl={item.imageUrl}
              categoryLabel={getCategoryLabel(item.category)}
              match={item.match}
              quality={item.quality}
              onOpen={() => {
                console.log('Open wardrobe item', item.id);
              }}
              onMore={() => {
                console.log('Open wardrobe item menu', item.id);
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

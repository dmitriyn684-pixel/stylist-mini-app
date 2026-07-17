import type { KeyboardEvent } from 'react';
import { MoreIcon, HangerIcon } from '../ui/icons';
import styles from './PremiumWardrobeCard.module.css';

type WardrobeItemQuality = 'good' | 'low';

interface PremiumWardrobeCardProps {
  index: number;
  title: string;
  imageUrl?: string;
  categoryLabel: string;
  match: number;
  quality?: WardrobeItemQuality;
  onOpen?: () => void;
  onMore?: () => void;
}

export function PremiumWardrobeCard({
  index,
  title,
  imageUrl,
  categoryLabel,
  match,
  quality,
  onOpen,
  onMore,
}: PremiumWardrobeCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen?.();
    }
  };

  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={styles.moreButton}
        onClick={(event) => {
          event.stopPropagation();
          onMore?.();
        }}
        aria-label="Меню вещи"
      >
        <MoreIcon />
      </button>

      {imageUrl ? (
        <img src={imageUrl} alt={title} className={styles.image} />
      ) : (
        <div className={styles.placeholder}>
          <HangerIcon className={styles.placeholderIcon} />
        </div>
      )}

      <div className={styles.shimmer} />
      <div className={styles.gradient} />

      {quality === 'low' && <div className={styles.qualityBadge}>Лучше переснять</div>}

      <div className={styles.panel}>
        <div className={styles.metaRow}>
          <span className={styles.indexTag}>{String(index).padStart(2, '0')}</span>
          <span className={styles.categoryTag}>{categoryLabel}</span>
        </div>

        <div className={styles.goldLine} />

        <h4 className={styles.title}>{title}</h4>

        <div className={styles.matchRow}>
          <span>AI match</span>
          <strong>{match}%</strong>
        </div>
      </div>
    </article>
  );
}

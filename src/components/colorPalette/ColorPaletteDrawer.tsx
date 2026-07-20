import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import styles from './ColorPaletteDrawer.module.css';

export interface PaletteColor {
  name: string;
  hex: string;
}

export interface UserPalette {
  seasonalType?: string;
  title?: string;
  description?: string;
  core?: PaletteColor[];
  accents?: PaletteColor[];
  neutrals?: PaletteColor[];
  avoid?: PaletteColor[];
  isFallback?: boolean;
}

export interface ColorPaletteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAskChristine: () => void;
  palette?: UserPalette;
}

const GROUPS: Array<{ key: 'core' | 'accents' | 'neutrals' | 'avoid'; label: string }> = [
  { key: 'core', label: 'Основные цвета' },
  { key: 'accents', label: 'Акцентные цвета' },
  { key: 'neutrals', label: 'Нейтрали' },
  { key: 'avoid', label: 'Лучше избегать' },
];

function normalizeHex(hex: string): string {
  const value = hex.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(value) ? value : '#D8D4CC';
}

export function ColorPaletteDrawer({ isOpen, onClose, onAskChristine, palette }: ColorPaletteDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !palette) return null;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onMouseDown={handleOverlayClick} aria-hidden="false">
      <section
        id="color-palette-drawer"
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="palette-drawer-title"
      >
        <div className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Personal color edit</span>
            <h2 id="palette-drawer-title">Моя палитра</h2>
          </div>
          <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={onClose} aria-label="Закрыть палитру">
            ×
          </button>
        </header>

        <div className={styles.scrollArea}>
          <section className={styles.seasonCard}>
            <span>Цветотип</span>
            <h3>{palette.title || palette.seasonalType || 'Не определён'}</h3>
            {palette.title && palette.seasonalType && palette.title !== palette.seasonalType && (
              <small>{palette.seasonalType}</small>
            )}
            <p>{palette.description || 'Палитра будет уточняться по мере анализа гардероба.'}</p>
            {palette.isFallback && <div className={styles.fallbackNote}>Временный пример — персональный анализ пока не найден</div>}
          </section>

          <div className={styles.groups}>
            {GROUPS.map(({ key, label }) => {
              const colors = palette[key] ?? [];
              return (
                <section key={key} className={styles.group}>
                  <div className={styles.groupHeading}>
                    <h3>{label}</h3>
                    <span>{colors.length}</span>
                  </div>
                  {colors.length ? (
                    <ul className={styles.swatchGrid}>
                      {colors.map((color, index) => {
                        const hex = normalizeHex(color.hex);
                        return (
                          <li
                            key={`${key}-${color.name}-${color.hex}`}
                            className={styles.swatchCard}
                            style={{ '--swatch-index': index } as CSSProperties}
                          >
                            <span className={styles.swatch} style={{ backgroundColor: hex }} aria-hidden="true" />
                            <span className={styles.swatchCopy}>
                              <strong>{color.name}</strong>
                              <small>{hex}</small>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className={styles.emptyGroup}>Пока не определены</p>
                  )}
                </section>
              );
            })}
          </div>

          <button type="button" className={styles.christineButton} onClick={onAskChristine}>
            Спросить Кристин про цвета
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}

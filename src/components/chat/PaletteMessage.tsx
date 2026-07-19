import type { ColorSwatch } from '../../types/analysis';
import styles from './PaletteMessage.module.css';

const GROUPS: { key: 'base' | 'accent' | 'avoid'; label: string }[] = [
  { key: 'base', label: 'Базовые' },
  { key: 'accent', label: 'Акцентные' },
  { key: 'avoid', label: 'Избегать' },
];

function SwatchRow({ swatch }: { swatch: ColorSwatch }) {
  return (
    <div className={styles.swatchRow}>
      <span className={styles.swatch} style={{ background: swatch.hex }} />
      <span className={styles.swatchName}>{swatch.name}</span>
      <span className={styles.swatchHex}>{swatch.hex.toUpperCase()}</span>
    </div>
  );
}

interface PaletteMessageProps {
  palette: { base: ColorSwatch[]; accent: ColorSwatch[]; avoid: ColorSwatch[] };
}

export function PaletteMessage({ palette }: PaletteMessageProps) {
  return (
    <div className={styles.palette}>
      {GROUPS.map(({ key, label }) => {
        const swatches = palette[key];
        if (!swatches?.length) return null;
        return (
          <section key={key} className={styles.group}>
            <h3>{label}</h3>
            <div className={styles.swatchList}>
              {swatches.map((swatch) => (
                <SwatchRow key={swatch.hex} swatch={swatch} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

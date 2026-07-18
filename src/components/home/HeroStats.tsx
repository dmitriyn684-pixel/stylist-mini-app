import { useColorAnalysis } from '../../hooks/useColorAnalysis';
import { useWardrobeStore } from '../../store/useWardrobeStore';
import homeEditorial from '../../assets/editorial/home-editorial.jpg';
import { ArrowRightIcon, ProfileIcon } from '../ui/icons';
import styles from '../../screens/HomeScreen.module.css';

interface HeroStatsProps {
  name: string | null;
  isEmpty: boolean;
  onProfileClick?: () => void;
  onCreateLook?: () => void;
}

function formatCount(count: number, forms: [string, string, string]): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;
  const form = remainder100 >= 11 && remainder100 <= 14 ? forms[2] : remainder10 === 1 ? forms[0] : remainder10 >= 2 && remainder10 <= 4 ? forms[1] : forms[2];
  return `${count} ${form}`;
}

export function HeroStats({ name, isEmpty, onProfileClick, onCreateLook }: HeroStatsProps) {
  const { result: colorResult } = useColorAnalysis();
  const items = useWardrobeStore((state) => state.items);
  const outfits = useWardrobeStore((state) => state.outfits);

  const colorType = colorResult?.seasonalType ?? null;
  const greeting = name ? `Добро пожаловать, ${name}` : 'Добро пожаловать';

  return (
    <section className={styles.heroSection} aria-labelledby="home-hero-title">
      <div className={styles.heroMedia}>
        <img src={homeEditorial} alt="Private fashion concierge" />
        <div className={styles.heroShade} />
        <div className={styles.heroAurora} aria-hidden="true" />
        <div className={styles.heroSweep} aria-hidden="true" />

        <div className={styles.heroTopline}>
          <span>Private fashion concierge</span>
          <button type="button" onClick={onProfileClick} aria-label="Открыть профиль">
            <ProfileIcon />
          </button>
        </div>

        <div className={styles.heroContent}>
          <p>{greeting}</p>
          <h1 id="home-hero-title">
            {isEmpty ? 'Начнём с твоего личного стиля' : 'Твой стиль — в точных деталях'}
          </h1>
          <span>
            {isEmpty
              ? 'Создадим персональную основу: палитру, гардероб и образы под твой ритм жизни.'
              : 'Спокойные решения для гардероба, образов и покупок — каждый день.'}
          </span>
          <button type="button" className={styles.heroCta} onClick={onCreateLook}>
            {isEmpty ? 'Начать персонализацию' : 'Собрать новый образ'}
            <ArrowRightIcon />
          </button>
        </div>
      </div>

      <div className={styles.summaryCard}>
        <div>
          <p className={styles.eyebrow}>Персональная сводка</p>
          <h2>{isEmpty ? 'Профиль готов к настройке' : 'Основа твоего стиля'}</h2>
        </div>
        <div className={styles.summaryChips}>
          <span>
            <small>Палитра</small>
            <b>{colorType ?? 'Не определена'}</b>
          </span>
          <span>
            <small>Гардероб</small>
            <b>{items.length > 0 ? formatCount(items.length, ['вещь', 'вещи', 'вещей']) : 'Ждёт вещей'}</b>
          </span>
          <span>
            <small>Образы</small>
            <b>{formatCount(outfits.length, ['лук', 'лука', 'луков'])}</b>
          </span>
        </div>
      </div>
    </section>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { HeroStats } from '../components/home/HeroStats';
import { useUserProfile } from '../hooks/useUserProfile';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { useWardrobeStore } from '../store/useWardrobeStore';
import {
  ArrowRightIcon,
  ChatIcon,
  HangerIcon,
  SparkleIcon,
  StylistIcon,
  WardrobeIcon,
} from '../components/ui/icons';
import styles from './HomeScreen.module.css';

interface DailyPriority {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  to: string;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { profile, hasProfile } = useUserProfile();
  const { result: colorResult } = useColorAnalysis();
  const items = useWardrobeStore((state) => state.items);
  const outfits = useWardrobeStore((state) => state.outfits);

  const name = profile?.name ?? null;
  const isEmpty = !hasProfile && !colorResult && items.length === 0;

  const dailyPriority: DailyPriority = !colorResult
    ? {
        eyebrow: 'Первый шаг',
        title: 'Определи свою палитру',
        description: 'Короткий анализ поможет точнее подбирать оттенки, вещи и готовые образы.',
        action: 'Пройти анализ стиля',
        to: '/analysis/color-type',
      }
    : items.length === 0
      ? {
          eyebrow: 'Сегодня важно',
          title: 'Добавь первую вещь',
          description: 'Начни с любимой вещи — так рекомендации сразу станут персональными.',
          action: 'Открыть гардероб',
          to: '/wardrobe',
        }
      : outfits.length === 0
        ? {
            eyebrow: 'Сегодня важно',
            title: 'Собери первый образ',
            description: 'AI уже может предложить сочетание из вещей твоего гардероба.',
            action: 'Собрать образ',
            to: '/wardrobe/outfits/generate',
          }
        : {
            eyebrow: 'Твой фокус сегодня',
            title: 'Освежи один из образов',
            description: 'Посмотри сохранённые луки или попроси стилиста предложить новую комбинацию.',
            action: 'Открыть мои луки',
            to: '/wardrobe/outfits',
          };

  return (
    <main className={styles.page}>
      <HeroStats
        name={name}
        isEmpty={isEmpty}
        onProfileClick={() => navigate('/profile')}
        onCreateLook={() => navigate(isEmpty ? '/analysis/color-type' : '/wardrobe/outfits/generate')}
      />

      <section className={styles.priorityCard} aria-labelledby="daily-priority-title">
        <div className={styles.priorityIcon} aria-hidden="true">
          <SparkleIcon />
        </div>
        <div className={styles.priorityCopy}>
          <p className={styles.eyebrow}>{dailyPriority.eyebrow}</p>
          <h2 id="daily-priority-title">{dailyPriority.title}</h2>
          <p>{dailyPriority.description}</p>
        </div>
        <Link className={styles.priorityLink} to={dailyPriority.to}>
          {dailyPriority.action}
          <ArrowRightIcon />
        </Link>
      </section>

      <section className={styles.conciergeSection} aria-labelledby="concierge-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Fashion concierge</p>
          <h2 id="concierge-title">Что сделаем сегодня?</h2>
        </div>

        <div className={styles.primaryActions}>
          <Link className={styles.primaryAction} to="/wardrobe/outfits/generate">
            <span className={styles.actionIcon} aria-hidden="true">
              <HangerIcon />
            </span>
            <span>
              <b>Собрать образ</b>
              <small>Из твоего гардероба</small>
            </span>
            <ArrowRightIcon className={styles.actionArrow} />
          </Link>

          <Link className={styles.secondaryAction} to="/chat">
            <span className={styles.actionIcon} aria-hidden="true">
              <ChatIcon />
            </span>
            <span>
              <b>Спросить стилиста</b>
              <small>Персональный совет</small>
            </span>
            <ArrowRightIcon className={styles.actionArrow} />
          </Link>
        </div>
      </section>

      <nav className={styles.quickNav} aria-label="Быстрые переходы">
        <Link to="/wardrobe">
          <WardrobeIcon />
          <span>Гардероб</span>
        </Link>
        <Link to="/stylist">
          <StylistIcon />
          <span>Стилист</span>
        </Link>
        <Link to="/wardrobe/outfits">
          <HangerIcon />
          <span>Мои луки</span>
        </Link>
      </nav>
    </main>
  );
}

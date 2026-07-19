import { Link, useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { useWardrobeStore } from '../store/useWardrobeStore';
import homeEditorialImage from '../assets/editorial/home-wardrobe-editorial.jpg';
import travelCapsuleImage from '../assets/editorial/travel-capsule.jpg';
import {
  ArrowRightIcon,
  ChatIcon,
  HangerIcon,
  ProfileIcon,
  SuitcaseIcon,
} from '../components/ui/icons';
import styles from './HomeScreen.module.css';

interface DailyPriority {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  to: string;
}

const STYLE_CHALLENGES = [
  'Собери монохромный образ и добавь один охристый акцент.',
  'Выбери вещь, которую давно не носила, и построй образ вокруг неё.',
  'Собери образ в эстетике quiet luxury из вещей своего гардероба.',
  'Оставь спокойную базу и добавь один выразительный аксессуар.',
];

function formatCount(count: number, forms: [string, string, string]): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;
  const form = remainder100 >= 11 && remainder100 <= 14
    ? forms[2]
    : remainder10 === 1
      ? forms[0]
      : remainder10 >= 2 && remainder10 <= 4
        ? forms[1]
        : forms[2];

  return `${count} ${form}`;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { profile, hasProfile } = useUserProfile();
  const { result: colorResult } = useColorAnalysis();
  const items = useWardrobeStore((state) => state.items);
  const outfits = useWardrobeStore((state) => state.outfits);

  const name = profile?.name ?? null;
  const isEmpty = !hasProfile && !colorResult && items.length === 0;
  const colorType = colorResult?.seasonalType ?? null;
  const greeting = name ? `Добро пожаловать, ${name}` : 'Добро пожаловать';
  const styleChallenge = STYLE_CHALLENGES[Math.floor(Date.now() / 86_400_000) % STYLE_CHALLENGES.length];

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
      <section className={styles.heroSection} aria-labelledby="home-hero-title">
        <div className={styles.heroMedia}>
          <img src={homeEditorialImage} alt="Рейл с одеждой в частном гардеробе" />
          <div className={styles.heroShade} />
          <div className={styles.heroAurora} aria-hidden="true" />
          <div className={styles.heroSweep} aria-hidden="true" />

          <div className={styles.heroTopline}>
            <span>Private fashion concierge</span>
            <button type="button" onClick={() => navigate('/profile')} aria-label="Открыть профиль">
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
          </div>
        </div>

        <section className={styles.styleSignal} aria-labelledby="style-signal-title">
          <div className={styles.styleSignalSweep} aria-hidden="true" />
          <div className={styles.styleSignalPalette} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.styleSignalCopy}>
            <p id="style-signal-title">Сегодня ваш стиль:</p>
            <strong>petrol + ivory + тёплый акцент</strong>
            <small>AI подобрал настроение дня по вашему гардеробу.</small>
          </div>
        </section>

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

      <section className={styles.priorityCard} aria-labelledby="daily-priority-title">
        <div className={styles.priorityIcon} aria-hidden="true">
          <HangerIcon />
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

          <Link className={`${styles.secondaryAction} ${styles.travelAction}`} to="/wardrobe/suitcase">
            <span className={styles.actionIcon} aria-hidden="true">
              <SuitcaseIcon />
            </span>
            <span>
              <b>Собрать чемодан</b>
              <small>Капсула для поездки</small>
            </span>
            <ArrowRightIcon className={styles.actionArrow} />
          </Link>

          <Link className={styles.secondaryAction} to="/wardrobe/outfits">
            <span className={styles.actionIcon} aria-hidden="true">
              <HangerIcon />
            </span>
            <span>
              <b>Мои луки</b>
              <small>Сохранённые образы</small>
            </span>
            <ArrowRightIcon className={styles.actionArrow} />
          </Link>
        </div>
      </section>

      <section className={styles.travelCard} aria-labelledby="travel-card-title">
        <img className={styles.travelImage} src={travelCapsuleImage} alt="Женщина с чемоданом в путешествии" />
        <div className={styles.travelAurora} aria-hidden="true" />
        <div className={styles.cardSweep} aria-hidden="true" />
        <div className={styles.travelTopline}>
          <p className={styles.darkEyebrow}>Travel capsule</p>
          <span>Private edit</span>
        </div>
        <div className={styles.travelIcon} aria-hidden="true">
          <SuitcaseIcon />
        </div>
        <h2 id="travel-card-title">Собрать чемодан без лишних вещей</h2>
        <p>AI подготовит капсулу для поездки с учётом погоды, событий и твоего личного стиля.</p>
        <Link className={styles.travelButton} to="/wardrobe/suitcase">
          Собрать чемодан
          <ArrowRightIcon />
        </Link>
      </section>

      <section className={styles.challengeCard} aria-labelledby="challenge-card-title">
        <div className={styles.challengeShimmer} aria-hidden="true" />
        <div className={styles.challengeHeader}>
          <p className={styles.eyebrow}>Style challenge</p>
          <span className={styles.challengeDot} aria-hidden="true" />
        </div>
        <h2 id="challenge-card-title">Челлендж дня</h2>
        <p>{styleChallenge}</p>
        <Link className={styles.challengeLink} to="/stylist">
          Открыть стилиста
          <ArrowRightIcon />
        </Link>
      </section>

    </main>
  );
}

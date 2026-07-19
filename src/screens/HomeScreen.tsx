import { Link, useNavigate } from 'react-router-dom';
import { HeroStats } from '../components/home/HeroStats';
import { useUserProfile } from '../hooks/useUserProfile';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { useWardrobeStore } from '../store/useWardrobeStore';
import travelCapsuleImage from '../assets/editorial/travel-capsule.jpg';
import {
  ArrowRightIcon,
  ChatIcon,
  HangerIcon,
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

export function HomeScreen() {
  const navigate = useNavigate();
  const { profile, hasProfile } = useUserProfile();
  const { result: colorResult } = useColorAnalysis();
  const items = useWardrobeStore((state) => state.items);
  const outfits = useWardrobeStore((state) => state.outfits);

  const name = profile?.name ?? null;
  const isEmpty = !hasProfile && !colorResult && items.length === 0;
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
      <HeroStats
        name={name}
        isEmpty={isEmpty}
        onProfileClick={() => navigate('/profile')}
        onCreateLook={() => navigate(isEmpty ? '/analysis/color-type' : '/wardrobe/outfits/generate')}
      />

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

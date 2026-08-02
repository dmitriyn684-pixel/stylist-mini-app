import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ProjectCaseCard } from '../components/ProjectCaseCard';
import { ShowcaseEffect } from '../components/ShowcaseEffects';
import styles from './DimkoffPublicSite.module.css';
import { ProjectVisual } from './ProjectVisual';

const PortalIntroScene = lazy(() =>
  import('./DimkoffPortalHero').then((module) => ({
    default: module.DimkoffPortalHero,
  })),
);
const ConceptSignalField = lazy(() =>
  import('./DimkoffStudioVisuals').then((module) => ({ default: module.ConceptSignalField })),
);
const SignalPortal = lazy(() =>
  import('./DimkoffStudioVisuals').then((module) => ({ default: module.SignalPortal })),
);

type Language = 'ru' | 'en';
type Copy = { ru: string; en: string };

const text = (copy: Copy, language: Language) => copy[language];

function handleTilt(event: PointerEvent<HTMLElement>) {
  const target = event.currentTarget;
  const bounds = target.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  target.style.setProperty('--rx', `${(0.5 - y) * 7}deg`);
  target.style.setProperty('--ry', `${(x - 0.5) * 9}deg`);
  target.style.setProperty('--px', `${x * 100}%`);
  target.style.setProperty('--py', `${y * 100}%`);
}

function resetTilt(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--rx', '0deg');
  event.currentTarget.style.setProperty('--ry', '0deg');
}

const directions = [
  {
    code: '01 / AI',
    title: { ru: 'AI-продукты', en: 'AI products' },
    body: {
      ru: 'Ассистенты, проверки, рекомендации и аналитика в понятном продукте.',
      en: 'Assistants, reviews, recommendations and analytics in a clear product.',
    },
  },
  {
    code: '02 / TG',
    title: { ru: 'Telegram Mini Apps', en: 'Telegram Mini Apps' },
    body: {
      ru: 'Боты, Mini Apps, личные кабинеты, оплаты и повторные сценарии.',
      en: 'Bots, Mini Apps, accounts, payments and repeat journeys.',
    },
  },
  {
    code: '03 / WEB',
    title: { ru: 'Digital Experiences', en: 'Digital Experiences' },
    body: {
      ru: 'Premium landing, 3D/WebGL-сайты и launch-витрины продуктов.',
      en: 'Premium landing pages, 3D/WebGL sites and product launch showcases.',
    },
  },
  {
    code: '04 / GROWTH',
    title: { ru: 'SMM + Growth Systems', en: 'SMM + Growth Systems' },
    body: {
      ru: 'Оффер, контент, воронка, Telegram-маршрут и запуск.',
      en: 'Offer, content, funnel, Telegram journey and launch.',
    },
  },
] as const;

const featuredProjects = [
  {
    name: 'CaloriePT AI 2.0',
    status: 'LIVE / AI NUTRITION',
    body: {
      ru: 'Telegram AI-продукт для питания и ежедневных сценариев.',
      en: 'A Telegram AI product for nutrition and everyday routines.',
    },
  },
  {
    name: 'Stylist AI',
    status: 'LIVE / FASHION MINI APP',
    body: {
      ru: 'Гардероб, палитра и персональная AI-консультация.',
      en: 'Wardrobe, palette and personal AI consultation.',
    },
  },
  {
    name: 'AI Director',
    status: 'CONCEPT / IN DEVELOPMENT',
    body: {
      ru: 'Деловой AI-партнёр для первого уровня бизнес-проверки.',
      en: 'A business AI partner for first-line operational review.',
    },
  },
  {
    name: 'Premium Digital Experience',
    status: 'SERVICE / 3D WEB',
    body: {
      ru: 'Сайты, product launch pages и motion-сцены для сильной презентации бизнеса.',
      en: 'Websites, product launch pages and motion scenes for strong business presentation.',
    },
  },
] as const;

const reasons = [
  {
    number: '01',
    title: { ru: 'SMM-мышление', en: 'SMM thinking' },
    body: {
      ru: 'Продукт начинается с аудитории, оффера и маршрута внимания.',
      en: 'The product starts with audience, offer and the attention journey.',
    },
  },
  {
    number: '02',
    title: { ru: 'AI / product логика', en: 'AI / product logic' },
    body: {
      ru: 'AI встраивается в полезный сценарий, а не существует ради технологии.',
      en: 'AI serves a useful journey instead of existing for technology alone.',
    },
  },
  {
    number: '03',
    title: { ru: 'Запуск под ключ', en: 'End-to-end launch' },
    body: {
      ru: 'Смысл, интерфейс, Telegram, сайт и первый MVP собираются как одна система.',
      en: 'Meaning, interface, Telegram, web and the first MVP form one system.',
    },
  },
  {
    number: '04',
    title: { ru: 'Telegram-first подход', en: 'Telegram-first approach' },
    body: {
      ru: 'Вход, личный кабинет, оплата и повторное действие живут в привычной среде.',
      en: 'Entry, account, payment and repeat action live in a familiar environment.',
    },
  },
  {
    number: '05',
    title: { ru: 'Визуальная упаковка', en: 'Visual packaging' },
    body: {
      ru: 'Продукт получает понятный образ, premium-интерфейс и сильную презентацию.',
      en: 'The product gets a clear image, premium interface and strong presentation.',
    },
  },
] as const;

function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M13 7h18c15.2 0 26 10.2 26 25S46.2 57 31 57H13V7Z" />
      <path d="M14 54 41.5 32 14 10v13.6L25.2 32 14 40.5V54Z" />
    </svg>
  );
}

function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('dimkoff-main-language');
    return saved === 'en' ? 'en' : 'ru';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('dimkoff-main-language', language);
  }, [language]);

  return { language, setLanguage };
}

function SiteHeader({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  const baseUrl = import.meta.env.BASE_URL;
  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/" aria-label="DimkoFF home">
        <span><BrandMark /></span>
        <strong>DIMKOFF.</strong>
      </Link>
      <nav aria-label="Main navigation">
        <Link to="/services">{language === 'ru' ? 'Услуги' : 'Services'}</Link>
        <Link to="/projects">{language === 'ru' ? 'Проекты' : 'Projects'}</Link>
        <Link to="/partnership">{language === 'ru' ? 'Партнёрам' : 'Partners'}</Link>
        <Link to="/concepts">{language === 'ru' ? 'Концепты' : 'Concepts'}</Link>
        <a href={`${baseUrl}portfolio/`}>{language === 'ru' ? 'Портфолио' : 'Portfolio'}</a>
      </nav>
      <div className={styles.headerActions}>
        <div className={styles.language}>
          <button type="button" aria-pressed={language === 'ru'} onClick={() => setLanguage('ru')}>RU</button>
          <i>/</i>
          <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
        </div>
        <a className={styles.headerCta} href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
          {language === 'ru' ? 'Обсудить проект' : 'Discuss a project'}
        </a>
      </div>
    </header>
  );
}

function Footer({ language }: { language: Language }) {
  return (
    <footer className={styles.footer}>
      <div>
        <strong>DIMKOFF.</strong>
        <span>{language === 'ru' ? 'SMM + AI PRODUCT BUILDER' : 'SMM + AI PRODUCT BUILDER'}</span>
      </div>
      <p>© 2026 / AI PRODUCTS / TELEGRAM / DIGITAL EXPERIENCES</p>
    </footer>
  );
}

function PublicShell({
  language,
  setLanguage,
  children,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  children: ReactNode;
}) {
  return (
    <div className={styles.site}>
      <SiteHeader language={language} setLanguage={setLanguage} />
      {children}
      <Footer language={language} />
    </div>
  );
}

export function DimkoffLandingLite() {
  const { language, setLanguage } = useLanguage();
  const baseUrl = import.meta.env.BASE_URL;
  const assets = useMemo(
    () => `${baseUrl}portfolio/assets/`,
    [baseUrl],
  );

  useEffect(() => {
    document.title = language === 'ru'
      ? 'DimkoFF — AI-продукты и digital-сцены'
      : 'DimkoFF — AI products and digital scenes';
  }, [language]);

  return (
    <PublicShell language={language} setLanguage={setLanguage}>
      <main data-testid="dimkoff-lite-home">
        <Suspense fallback={<div className={styles.heroFallback}>DIMKOFF / DIGITAL PORTAL</div>}>
          <PortalIntroScene language={language} />
        </Suspense>

        <section className={styles.homeSection} id="services">
          <div className={styles.sectionHead}>
            <p>01 / {language === 'ru' ? 'ЧТО МОЖНО СОБРАТЬ' : 'WHAT WE CAN BUILD'}</p>
            <h2>{language === 'ru' ? 'От идеи до работающего digital-продукта' : 'From an idea to a working digital product'}</h2>
            <Link to="/services">{language === 'ru' ? 'Все услуги' : 'All services'} ↗</Link>
          </div>
          <div className={styles.directionGrid}>
            {directions.map((direction) => (
              <Link
                to="/services"
                key={direction.code}
                onPointerMove={handleTilt}
                onPointerLeave={resetTilt}
                style={{ '--rx': '0deg', '--ry': '0deg' } as CSSProperties}
              >
                <b aria-hidden="true"><i /><i /><i /></b>
                <span>{direction.code}</span>
                <h3>{text(direction.title, language)}</h3>
                <p>{text(direction.body, language)}</p>
                <i>↗</i>
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.homeSection} ${styles.featuredSection}`} id="projects">
          <div className={styles.sectionHead}>
            <p>02 / {language === 'ru' ? 'ИЗБРАННЫЕ ПРОЕКТЫ' : 'FEATURED PROJECTS'}</p>
            <h2>{language === 'ru' ? 'Три продукта. Три разных бизнес-сценария.' : 'Three products. Three business scenarios.'}</h2>
            <Link to="/projects">{language === 'ru' ? 'Все проекты' : 'All projects'} ↗</Link>
          </div>
          <div className={styles.featuredGrid}>
            {featuredProjects.map((project) => (
              <Link
                to={project.name === 'AI Director' ? '/concepts' : project.name === 'Premium Digital Experience' ? '/services' : '/projects'}
                key={project.name}
                onPointerMove={handleTilt}
                onPointerLeave={resetTilt}
                style={{ '--rx': '0deg', '--ry': '0deg' } as CSSProperties}
              >
                <figure><ProjectVisual name={project.name} status={project.status} compact /></figure>
                <span>{project.status}</span>
                <h3>{project.name}</h3>
                <p>{text(project.body, language)}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.homeSection} ${styles.reasonSection}`}>
          <div className={styles.sectionHead}>
            <p>03 / {language === 'ru' ? 'ПОЧЕМУ ЭТО РАБОТАЕТ' : 'WHY IT WORKS'}</p>
            <h2>{language === 'ru' ? 'Не отдельный сайт или бот. Одна продуктовая система.' : 'Not a separate site or bot. One product system.'}</h2>
          </div>
          <div className={styles.reasonGrid}>
            {reasons.map((reason) => (
              <article key={reason.number}>
                <span>{reason.number}</span>
                <h3>{text(reason.title, language)}</h3>
                <p>{text(reason.body, language)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.homeSection} ${styles.portfolioBand}`}>
          <div className={styles.portfolioCopy}>
            <p>04 / CASE LAB</p>
            <h2>{language === 'ru' ? 'Портфолио и визуальная система' : 'Portfolio and visual system'}</h2>
            <span>
              {language === 'ru'
                ? 'Глубокие кейсы, брендбук, PDF и Digital Experiences собраны на втором уровне сайта.'
                : 'Deep cases, brandbook, PDFs and Digital Experiences live on the second site level.'}
            </span>
            <div>
              <a href={`${baseUrl}portfolio/`}>{language === 'ru' ? 'Открыть портфолио' : 'Open portfolio'} ↗</a>
              <a href={`${baseUrl}portfolio/dimkoff-brandbook-2026-visual-v2.pdf`}>
                {language === 'ru' ? 'Открыть брендбук' : 'Open brandbook'} ↗
              </a>
            </div>
          </div>
          <figure className={styles.portfolioPreview}>
            <img src={`${assets}brandbook-founder-site.webp`} alt="DimkoFF Visual Brandbook" loading="lazy" />
            <span>VISUAL SYSTEM / 2026</span>
          </figure>
        </section>

        <section className={`${styles.homeSection} ${styles.contact}`} id="contact">
          <Suspense fallback={null}><SignalPortal language={language} /></Suspense>
          <p>05 / CONTACT</p>
          <h2>{language === 'ru' ? 'Обсудить AI-продукт или Telegram Mini App' : 'Discuss an AI product or Telegram Mini App'}</h2>
          <div>
            <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">Telegram ↗</a>
            <Link to="/services">{language === 'ru' ? 'Смотреть услуги' : 'View services'} ↗</Link>
            <Link to="/projects">{language === 'ru' ? 'Смотреть проекты' : 'View projects'} ↗</Link>
            <a href="tel:+79999357608">+7 999 935-76-08</a>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

const serviceSections = [
  {
    number: '01',
    title: { ru: 'AI-продукты для бизнеса', en: 'AI products for business' },
    lead: {
      ru: 'AI превращается в конкретный рабочий сценарий: проверяет, рекомендует, анализирует и помогает принимать решения.',
      en: 'AI becomes a practical workflow: reviewing, recommending, analysing and supporting decisions.',
    },
    items: ['AI Director и ассистенты', 'Проверка документов', 'RAG-базы знаний', 'AI-консультанты', 'Нутрициологи и стилисты', 'Нишевые AI-боты'],
    audience: { ru: 'Бизнес, эксперты, fitness, wellness, fashion, онлайн-школы', en: 'Businesses, experts, fitness, wellness, fashion and online schools' },
    result: { ru: 'Продаваемый AI-продукт, автоматизация консультаций и аналитика', en: 'A sellable AI product, automated consulting and analytics' },
  },
  {
    number: '02',
    title: { ru: 'Telegram Mini Apps', en: 'Telegram Mini Apps' },
    lead: {
      ru: 'Продукт внутри привычного Telegram — без отдельной регистрации и долгого входа.',
      en: 'A product inside familiar Telegram — without a separate registration or long onboarding.',
    },
    items: ['Mini App и бот', 'Личный кабинет', 'Фото и файлы', 'Оплата и подписки', 'Уведомления', 'Админка + AI'],
    audience: { ru: 'Онлайн-сервисы, сообщества, личные бренды', en: 'Online services, communities, personal brands' },
    result: { ru: 'Быстрый вход, база пользователей и повторный сценарий внутри Telegram', en: 'Fast entry, a user base and repeat journey inside Telegram' },
  },
  {
    number: '03',
    title: { ru: 'Digital Experiences', en: 'Digital Experiences' },
    lead: {
      ru: 'Сайты, которые объясняют ценность и создают ощущение продукта без визуального шума.',
      en: 'Sites that communicate value and create a product feeling without visual noise.',
    },
    items: ['Premium landing', '3D / WebGL site', 'Personal brand site', 'Product launch page', 'Hospitality website', 'Portfolio + brandbook'],
    audience: { ru: 'Бизнес, рестораны, клубы, эксперты, premium-продукты', en: 'Businesses, hospitality, experts and premium products' },
    result: { ru: 'Сильная подача, доверие и понятный оффер', en: 'Strong presentation, trust and a clear offer' },
  },
  {
    number: '04',
    title: { ru: 'SMM + Growth', en: 'SMM + Growth' },
    lead: {
      ru: 'От упаковки и контента до Telegram-маршрута, прогрева и первых заявок.',
      en: 'From packaging and content to the Telegram journey, warm-up and first leads.',
    },
    items: ['Упаковка оффера', 'Контент-воронка', 'Telegram-маршрут', 'Прогрев и реклама', 'Reels и лид-магниты', 'Landing → заявка'],
    audience: { ru: 'Эксперты, продукты, новые направления', en: 'Experts, products, new business lines' },
    result: { ru: 'Маршрут от внимания до первого действия', en: 'A journey from attention to first action' },
  },
  {
    number: '05',
    title: { ru: 'Brand System', en: 'Brand System' },
    lead: {
      ru: 'Позиционирование, фирменный язык и продуктовая упаковка, которые делают предложение узнаваемым и цельным.',
      en: 'Positioning, brand language and product packaging that make an offer coherent and recognisable.',
    },
    items: ['Название и позиционирование', 'Visual system', 'Brandbook', 'Презентация', 'Коммерческое предложение', 'Landing copy'],
    audience: { ru: 'Личные бренды, эксперты, новые продукты', en: 'Personal brands, experts, new products' },
    result: { ru: 'Единый образ продукта во всех точках контакта', en: 'One product image across every touchpoint' },
  },
  {
    number: '06',
    title: { ru: 'Automation', en: 'Automation' },
    lead: {
      ru: 'Соединяем AI, Telegram, данные и уведомления в процессы, которые снимают повторяющуюся ручную работу.',
      en: 'We connect AI, Telegram, data and alerts into processes that remove repetitive manual work.',
    },
    items: ['Заявки и CRM-логика', 'AI-сводки', 'Уведомления', 'Отчёты', 'Регулярные проверки', 'Базы знаний + RAG'],
    audience: { ru: 'Команды с повторяющимися операциями', en: 'Teams with repetitive operations' },
    result: { ru: 'Меньше рутины, быстрее действие, прозрачнее контроль', en: 'Less routine, faster action, clearer control' },
  },
] as const;

const projectCases = [
  {
    title: 'CaloriePT AI 2.0', category: 'Wellness / Fitness / Nutrition', status: 'Live product', visual: 'calorie' as const,
    intro: 'AI-нутрициолог и Telegram Mini App для питания, дневника калорий, привычек и сопровождения клиентов.',
    problem: 'Фитнес-клубам, тренерам и wellness-проектам сложно удерживать клиента после тренировки. Питание, привычки и ежедневная дисциплина остаются вне клуба.',
    solution: 'CaloriePT переносит сопровождение в Telegram: фото еды, КБЖУ, дневник, AI-итог дня, рецепты из холодильника, список покупок и сценарии для клубов.',
    model: ['Subscription', 'White-label', 'License', 'Marketplace', 'Ambassadors'],
    links: [{ label: 'Открыть продукт', href: 'https://t.me/Calorie_counter_rf_bot' }],
  },
  {
    title: 'Stylist AI', category: 'Fashion / Beauty / Personal Style', status: 'Product direction', visual: 'stylist' as const,
    intro: 'AI-стилист и Mini App для цифрового гардероба, образов и персональных рекомендаций.',
    problem: 'Стилисты, бренды и fashion-комьюнити продают через контент, но не имеют интерактивного продукта внутри своей аудитории.',
    solution: 'Stylist AI превращает гардероб, подбор образов и рекомендации в премиальный Mini App с возможностью white-label под стилиста или бренд.',
    model: ['Subscription', 'White-label', 'Fashion commerce', 'Consultations', 'Community'],
    links: [{ label: 'Открыть Mini App', href: '/app' }],
  },
  {
    title: 'Psy Mind AI', category: 'Mental Wellness / Self-reflection', status: 'Bot product', visual: 'psy' as const,
    intro: 'AI-помощник для саморефлексии, тревоги, выгорания, отношений, энергии и планирования.',
    problem: 'Люди часто не готовы сразу идти к психологу: стыдно, дорого или непонятно, с чего начать разговор о своём состоянии.',
    solution: 'Psy Mind AI снижает первый барьер: помогает сформулировать состояние, пройти мягкий разбор, получить упражнение и понять, когда обратиться к специалисту.',
    note: 'Не является медицинским или психотерапевтическим сервисом, не ставит диагнозы и не заменяет специалиста.',
    model: ['Subscription', 'White-label', 'Lead generation', 'Paid programs', 'Corporate wellbeing'],
    links: [{ label: 'Открыть продукт', href: 'https://t.me/psy_mind_rf_bot' }],
  },
  {
    title: 'Businessmen AI', category: 'Business Education / AI Mentor', status: 'Bot product', visual: 'business' as const,
    intro: 'AI-наставник для предпринимателей, бизнес-клубов, онлайн-школ и экспертных Telegram-продуктов.',
    problem: 'Образовательным проектам сложно удерживать ученика между уроками, эфирами и консультациями.',
    solution: 'AI-наставник работает как постоянный слой поддержки: идеи, стратегия, продажи, мышление и вопросы по бизнесу превращаются в следующий шаг.',
    model: ['Subscription', 'White-label', 'Course leads', 'Education programs'],
    links: [{ label: 'Открыть продукт', href: 'https://t.me/businessmen_ai_bot' }],
  },
  {
    title: 'AI Director', category: 'Business Control / RAG / Documents', status: 'In development', visual: 'director' as const,
    intro: 'Онлайн-директор для малого и среднего бизнеса: проверка документов, риски, маркетинг, деньги и рекомендации собственнику.',
    problem: 'Собственник часто видит проблему слишком поздно: деньги уже потеряны, договор подписан, реклама не окупилась или задачи просрочены.',
    solution: 'AI Director даёт первичный бизнес-разбор: договоры, КП, налоги, маркетинг, риски, источники и план действий.',
    note: 'Не заменяет юриста, бухгалтера, финансового директора или собственника. Это AI-слой первичного анализа и поддержки решений.',
    model: ['B2B', 'Company deployment', 'White-label', 'License', 'Support'],
    links: [{ label: 'Смотреть концепт', href: '/concepts' }],
  },
  {
    title: 'DimkoFF Brand System', category: 'Brandbook / Visual Identity / Sales Pack', status: 'Completed visual system', visual: 'brandbook' as const,
    intro: 'Премиальная визуальная система для AI Product Studio: брендбук, продуктовая архитектура, презентации, коммерческие материалы и investor-ready упаковка.',
    problem: 'AI-продукты невозможно продавать дорого, если они выглядят как набор Telegram-ботов без единого позиционирования и языка.',
    solution: 'Brand System собирает студию в одно целое: Visual Guideline 2026, продуктовую линейку, AI Studio messaging, клиентские презентации и материалы для партнёров и инвесторов.',
    model: ['Brandbook', 'Visual System', 'Investor-ready', 'Partner Pack', 'AI Studio'],
    links: [{ label: 'Открыть брендбук', href: '/portfolio/dimkoff-brandbook-2026-visual-v2.pdf' }, { label: 'Смотреть визуальную систему', href: '/portfolio/' }],
  },
];

const editorialPortfolioItems = projectCases.map((project) => ({
  title: project.title,
  label: project.category.split(' / ').slice(0, 2).join(' / '),
  description: project.intro,
}));

const serviceLayerItems = [
  { label: '01', title: 'Product logic', description: 'Ниша, оффер, роли пользователей, сценарии, платные уровни и партнёрская модель.' },
  { label: '02', title: 'Telegram Mini App', description: 'Интерфейс внутри Telegram, бот, авторизация, заявки, уведомления и оплата.' },
  { label: '03', title: 'AI Layer', description: 'LLM, RAG, промпты, обработка файлов, фото, текстов и бизнес-данных.' },
  { label: '04', title: 'Growth system', description: 'Воронка, подписка, white-label, реклама, партнёры и коммерческое предложение.' },
];

const partnershipItems = [
  { label: 'White-label', title: 'Продукт под бренд партнёра', description: 'Фитнес-клуб, стилист, психолог, школа, эксперт или компания.' },
  { label: 'License', title: 'Лицензирование готового решения', description: 'Партнёр получает готовую основу и запускает её в своей аудитории.' },
  { label: 'Revenue share', title: 'Совместный запуск с экспертом', description: 'Эксперт даёт аудиторию и методологию, мы — продукт и воронку.' },
  { label: 'Investor', title: 'Развитие портфеля AI-продуктов', description: 'Масштабирование через рекламу, B2B, клубы, франшизы и комьюнити.' },
];

const brandSystemItems = [
  { label: 'Brandbook', title: 'DimkoFF Brandbook 2026', description: 'Позиционирование, продуктовая система, tone of voice и коммерческая рамка.' },
  { label: 'Visual', title: 'Visual Guideline', description: 'Цвет, типографика, 3D, motion, glass и dark premium AI style.' },
  { label: 'Sales', title: 'Investor / Partner Pack', description: 'Материалы для переговоров, презентаций, white-label и лицензий.' },
];

const conceptSheets = [
  ['01', 'AI Director', 'CONCEPT / IN DEVELOPMENT', 'Деловой AI-партнёр в Telegram для собственников малого и среднего бизнеса.', 'Собственники малого и среднего бизнеса.', 'Договоры, коммерческие предложения, отчёты, сделки, поставщики, задачи и финансовые риски требуют быстрой первичной проверки.', 'Первый уровень проверки: вердикт, красные флаги и следующий шаг. Не заменяет юриста, бухгалтера или финдиректора полностью, но помогает понять, где можно потерять деньги.', 'Снижает стоимость первой проверки и помогает быстрее подключить нужного специалиста.', ['Проверка договора', 'Деньги под риском', 'RAG-база', 'Вердикт', 'Вопросы специалисту', 'PDF-отчёт']],
  ['02', 'ExpertOS', 'CONCEPT', 'AI-система для эксперта.', 'Эксперты, консультанты и авторы методик.', 'Консультации, контент, клиенты и методика живут отдельно.', 'Единая среда знаний, Mini App, продуктов и сопровождения.', 'Превращает экспертность в масштабируемую продуктовую систему.', ['Консультации', 'База знаний', 'Mini App', 'Продукты', 'Заявки', 'Прогрев']],
  ['03', 'BriefPilot', 'CONCEPT', 'AI-помощник для сильных брифов.', 'Студии, агентства и фрилансеры.', 'Некачественные заявки и потеря времени до старта.', 'Собирает вводные, уточняет задачу и готовит ТЗ.', 'Сокращает пресейл и повышает качество постановки задачи.', ['Вводные', 'Уточнения', 'ТЗ', 'Квалификация']],
  ['04', 'LaunchKit', 'CONCEPT', 'Набор для быстрого запуска продукта.', 'Эксперты и небольшие команды.', 'Идея не превращается в последовательный запуск.', 'Landing, bot, Mini App, оффер, контент и аналитика.', 'Даёт один управляемый маршрут от идеи до первых заявок.', ['Landing', 'Bot', 'Mini App', 'Offer', 'Content', 'Analytics']],
  ['05', 'Signal House', 'CONCEPT', 'Система личного бренда.', 'Основатели, эксперты и новые продукты.', 'Сайт, контент, Telegram и продукты не складываются в единый образ.', 'Карта смыслов, брендбук, сайт и точки контакта.', 'Собирает узнаваемый бренд и продуктовую экосистему.', ['Сайт', 'Brandbook', 'Контент', 'Telegram', 'Продукты']],
  ['06', 'Signal Field 3D', 'CONCEPT', 'Направление premium digital experiences.', 'Бренды, события и premium-продукты.', 'Обычный лендинг не передаёт ощущение продукта.', '3D-сайты, interactive scenes, premium web и motion.', 'Создаёт запоминаемое digital-пространство без визуального шума.', ['3D websites', 'Interactive scenes', 'Premium web', 'Motion']],
] as const;

function InnerHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section className={styles.innerHero}>
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <span>{lead}</span>
    </section>
  );
}

export function DimkoffServicesPage() {
  const { language, setLanguage } = useLanguage();
  useEffect(() => {
    document.title = language === 'ru' ? 'Услуги — DimkoFF' : 'Services — DimkoFF';
  }, [language]);

  return (
    <PublicShell language={language} setLanguage={setLanguage}>
      <main data-testid="dimkoff-services-page">
        <InnerHero
          eyebrow="01 / SERVICES"
          title={language === 'ru' ? 'Что можно заказать' : 'What you can order'}
          lead={language === 'ru'
            ? 'Шесть направлений, которые можно собрать отдельно или соединить в один запуск.'
            : 'Six directions that can work separately or become one launch.'}
        />
        <ShowcaseEffect
          variant="darkServiceLayers"
          eyebrow="What we build"
          title="AI-продукт под ключ: от идеи до монетизации."
          subtitle="Мы собираем не просто интерфейс, а коммерческую систему: Mini App, bot logic, AI, платежи, подписку, white-label и сценарии продаж."
          items={serviceLayerItems}
        />
        <div className={styles.serviceSheets}>
          {serviceSections.map((section, index) => (
            <section key={section.number} data-visual={String(index + 1).padStart(2, '0')}>
              <span>{section.number}</span>
              <div className={styles.serviceCopy}>
                <h2>{text(section.title, language)}</h2>
                <p>{text(section.lead, language)}</p>
                <dl>
                  <div><dt>{language === 'ru' ? 'Для кого' : 'Audience'}</dt><dd>{text(section.audience, language)}</dd></div>
                  <div><dt>{language === 'ru' ? 'Результат' : 'Result'}</dt><dd>{text(section.result, language)}</dd></div>
                </dl>
                <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
                  {language === 'ru' ? 'Обсудить направление' : 'Discuss this direction'} ↗
                </a>
              </div>
              <div className={styles.serviceVisual} aria-hidden="true">
                <i /><i /><i /><b>{section.number}</b><small>DFF / PRODUCT LAYER</small>
              </div>
              <ul><li><em>{language === 'ru' ? 'Что входит' : 'Included'}</em></li>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          ))}
        </div>
        <PageContact language={language} />
      </main>
    </PublicShell>
  );
}

export function DimkoffProjectsPage() {
  const { language, setLanguage } = useLanguage();
  useEffect(() => {
    document.title = language === 'ru' ? 'Проекты — DimkoFF' : 'Projects — DimkoFF';
  }, [language]);

  return (
    <PublicShell language={language} setLanguage={setLanguage}>
      <main data-testid="dimkoff-projects-page">
        <InnerHero
          eyebrow="02 / PRODUCT PORTFOLIO"
          title={language === 'ru' ? 'Портфель AI-продуктов, а не набор ботов' : 'An AI product portfolio, not a set of bots'}
          lead={language === 'ru'
            ? 'DimkoFF AI Studio развивает Telegram Mini Apps и AI-сервисы в wellness, fashion, psychology, business education и business control. Каждый проект можно развивать как подписку, white-label, лицензию, партнёрство или B2B-внедрение.'
            : 'DimkoFF AI Studio develops Telegram Mini Apps and AI services across wellness, fashion, psychology, business education and business control — ready for subscription, white-label, license, partnership or B2B.'}
        />
        <div className={styles.projectsHeroActions}>
          <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">Обсудить партнёрство ↗</a>
          <a href="#product-cases">Смотреть продукты ↓</a>
          <a href="https://t.me/Calorie_counter_rf_bot" target="_blank" rel="noreferrer">Открыть CaloriePT ↗</a>
        </div>
        <ShowcaseEffect
          variant="editorialList"
          eyebrow="Product portfolio"
          title="Не боты. Портфель AI-продуктов."
          subtitle="Каждый проект — отдельное коммерческое направление: с нишей, аудиторией, бизнес-моделью и возможностью white-label, лицензии или партнёрства."
          items={editorialPortfolioItems}
        />
        <section className={styles.projectCases} id="product-cases">
          <div className={styles.projectCasesHead}><p>03 / PRODUCT CASES</p><h2>Шесть направлений.<br />Одна продуктовая экосистема.</h2></div>
          {projectCases.map((project) => (
            <ProjectCaseCard
              key={project.title}
              {...project}
              ctas={project.links.map((link) => ({ ...link, href: link.href.startsWith('/') ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${link.href}` : link.href }))}
            />
          ))}
        </section>
        <section className={styles.partnershipStrip}>
          <span>SUBSCRIPTION / WHITE-LABEL / LICENSE / PARTNERSHIP / B2B</span>
          <h2>Каждый проект можно развивать как отдельную коммерческую модель.</h2>
          <Link to="/partnership">Посмотреть модели партнёрства ↗</Link>
        </section>
        <section className={styles.projectFinalCta}>
          <p>BUY / LICENSE / BUILD</p>
          <h2>Обсудить покупку, лицензию или white-label запуск</h2>
          <div><a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">Telegram ↗</a><a href="tel:+79999357608">+7 999 935-76-08</a></div>
        </section>
      </main>
    </PublicShell>
  );
}

export function DimkoffConceptsPage() {
  const { language, setLanguage } = useLanguage();
  useEffect(() => {
    document.title = language === 'ru' ? 'Concept Lab — DimkoFF' : 'Concept Lab — DimkoFF';
  }, [language]);

  return (
    <PublicShell language={language} setLanguage={setLanguage}>
      <main data-testid="dimkoff-concepts-page">
        <Suspense fallback={<div className={styles.heroFallback}>DFF / SIGNAL FIELD</div>}>
          <ConceptSignalField language={language} />
        </Suspense>
        <ShowcaseEffect
          variant="hoverSpaceCards"
          eyebrow="Visual system"
          title="Брендбук как продуктовая упаковка."
          subtitle="DimkoFF Brand System показывает студию не как набор ботов, а как AI Product Studio с визуальным языком, продуктовой архитектурой и материалами для продаж."
          items={brandSystemItems}
        />
        <div className={styles.conceptSheets}>
          {conceptSheets.map(([number, name, status, what, audience, pain, product, benefit, features], index) => (
            <article
              key={name}
              className={index === 0 ? styles.conceptFeatured : undefined}
              onPointerMove={handleTilt}
              onPointerLeave={resetTilt}
              style={{ '--rx': '0deg', '--ry': '0deg' } as CSSProperties}
            >
              <header><span>{number}</span><small>{status}</small></header>
              <div className={styles.conceptVisual} aria-hidden="true"><i /><i /><i /><b>{number}</b></div>
              <h2>{name}</h2>
              <dl>
                <div><dt>{language === 'ru' ? 'Что' : 'What'}</dt><dd>{what}</dd></div>
                <div><dt>{language === 'ru' ? 'Для кого' : 'Audience'}</dt><dd>{audience}</dd></div>
                <div><dt>{language === 'ru' ? 'Боль' : 'Pain'}</dt><dd>{pain}</dd></div>
                <div><dt>{language === 'ru' ? 'Как работает' : 'How it works'}</dt><dd>{product}</dd></div>
                <div><dt>{language === 'ru' ? 'Бизнес-польза' : 'Business value'}</dt><dd>{benefit}</dd></div>
              </dl>
              <div className={styles.conceptFeatures}>
                {features.map((feature) => <span key={feature}>{feature}</span>)}
              </div>
            </article>
          ))}
        </div>
        <PageContact language={language} />
      </main>
    </PublicShell>
  );
}

export function DimkoffPartnershipPage() {
  const { language, setLanguage } = useLanguage();
  useEffect(() => { document.title = language === 'ru' ? 'Партнёрство — DimkoFF' : 'Partnership — DimkoFF'; }, [language]);

  return (
    <PublicShell language={language} setLanguage={setLanguage}>
      <main data-testid="dimkoff-partnership-page">
        <InnerHero
          eyebrow="03 / PARTNERSHIP"
          title={language === 'ru' ? 'Запускаем AI-продукты вместе' : 'Building AI products together'}
          lead={language === 'ru' ? 'Готовая продуктовая основа, ваша аудитория или экспертиза и понятная модель роста — без разработки с нуля.' : 'A proven product foundation, your audience or expertise and a clear growth model — without building from zero.'}
        />
        <ShowcaseEffect
          variant="glassMotion"
          eyebrow="Partnership models"
          title="Не разовая разработка. Долгосрочная модель заработка."
          subtitle="Один AI-продукт можно продавать как подписку, white-label, лицензию, B2B-внедрение или совместное направление с экспертом."
          items={partnershipItems}
        />
        <section className={styles.partnerProof}>
          <p>WHAT WE BRING</p>
          <div><article><span>01</span><h2>Продукт</h2><p>Архитектура, Mini App, AI-логика, интерфейс и готовая основа для запуска.</p></article><article><span>02</span><h2>Упаковка</h2><p>Оффер, brand system, коммерческие материалы и маршрут из контента в продукт.</p></article><article><span>03</span><h2>Рост</h2><p>Подписка, white-label, лицензия, revenue share или B2B-модель под задачу.</p></article></div>
        </section>
        <PageContact language={language} />
      </main>
    </PublicShell>
  );
}

function PageContact({ language }: { language: Language }) {
  return (
    <section className={styles.pageContact}>
      <Suspense fallback={null}><SignalPortal language={language} /></Suspense>
      <p>START / TELEGRAM</p>
      <h2>{language === 'ru' ? 'Есть задача для продукта?' : 'Have a product task?'}</h2>
      <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
        {language === 'ru' ? 'Обсудить проект' : 'Discuss a project'} ↗
      </a>
    </section>
  );
}

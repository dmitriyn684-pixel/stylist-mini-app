import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './DimkoffPublicSite.module.css';
import { ProjectVisual } from './ProjectVisual';

const PortalIntroScene = lazy(() =>
  import('./DimkoffPortalHero').then((module) => ({
    default: module.DimkoffPortalHero,
  })),
);
const ServiceMotionStage = lazy(() =>
  import('./DimkoffStudioVisuals').then((module) => ({ default: module.ServiceMotionStage })),
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

const allProjects = [
  ['01', 'CaloriePT AI 2.0', 'LIVE', 'Telegram AI-продукт для питания.', 'Люди, которые считают рацион и формируют привычки.', 'Сложный ежедневный расчёт и повторные действия.', 'Полный цикл AI + Telegram + база продуктов.', ['Фото еды', 'КБЖУ', 'Дневник', 'AI-итог дня', 'Рецепты из холодильника', 'AI-нутрициолог Анна'], 'https://caloriept.ru/webapp.html'],
  ['02', 'Stylist AI', 'LIVE', 'Персональный AI-стилист внутри Telegram Mini App.', 'Пользователи fashion, beauty и wardrobe-сервисов.', 'Выбор образов, палитры и системная работа с гардеробом.', 'Продуктовую глубину, premium fashion UI и сложную Mini App-архитектуру.', ['Гардероб', 'Образы', 'AI-стилист', 'Палитра', 'Fashion-рекомендации'], '/app'],
  ['03', 'Psy Mind AI', 'DEMO', 'AI-помощник для саморефлексии и мягкой психологической поддержки.', 'Пользователи бережных reflection-сценариев.', 'Регулярная рефлексия между сессиями. Не медицинский продукт.', 'Адаптацию AI-продукта под чувствительную нишу.', ['Mood signal', 'Reflection prompts', 'Дневной фокус'], 'https://t.me/psy_mind_rf_bot'],
  ['04', 'Businessmen AI', 'DEMO', 'AI-наставник для бизнес-обучения и предпринимательских сценариев.', 'Предприниматели и аудитория бизнес-образования.', 'Переход от вопроса к структуре решения и плану действий.', 'Работу с образовательным продуктом и AI-ролью.', ['Mentor insight', 'Frameworks', 'Action plan'], 'https://t.me/businessmen_ai_bot'],
  ['05', 'Pulse AI Coach', 'DEMO', 'AI-коуч по привычкам, фокусу, энергии и дисциплине.', 'Люди, которым важны performance и системные действия.', 'Переход от намерения к повторяемому действию.', 'Широту продуктовой линейки Telegram AI.', ['Streak', 'Pulse score', 'Focus', 'Progress'], 'https://t.me/PulseAICoach_bot'],
  ['06', 'Visual Brandbook DimkoFF', 'CASE', 'Брендбук и визуальная система AI Product Builder.', 'Клиенты, работодатели и партнёры.', 'Единое позиционирование, digital-язык и презентация компетенций.', 'Связку стратегии, SMM, арт-дирекции и product packaging.', ['35 страниц', 'Visual system', 'Digital experiences', 'PDF'], '/portfolio/dimkoff-brandbook-2026-visual-v2.pdf'],
] as const;

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
        <Suspense fallback={<div className={styles.motionFallback}>DFF / SERVICE SYSTEM</div>}>
          <ServiceMotionStage language={language} />
        </Suspense>
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
      <main className={styles.lightPage} data-testid="dimkoff-projects-page">
        <InnerHero
          eyebrow="02 / REAL PRODUCTS"
          title={language === 'ru' ? 'Реальные проекты' : 'Real projects'}
          lead={language === 'ru'
            ? 'AI-продукты и Telegram-сценарии в разных нишах — без смешивания с будущими концептами.'
            : 'AI products and Telegram journeys across niches — separate from future concepts.'}
        />
        <div className={styles.projectSheets}>
          {allProjects.map(([number, name, status, what, audience, pain, proof, features, url]) => (
            <article
              key={name}
              onPointerMove={handleTilt}
              onPointerLeave={resetTilt}
              style={{ '--rx': '0deg', '--ry': '0deg' } as CSSProperties}
            >
              <span>{number}</span>
              <div className={styles.projectTitle}><small>{status}</small><h2>{name}</h2></div>
              <dl>
                <div><dt>{language === 'ru' ? 'Что' : 'What'}</dt><dd>{what}</dd></div>
                <div><dt>{language === 'ru' ? 'Для кого' : 'Audience'}</dt><dd>{audience}</dd></div>
                <div><dt>{language === 'ru' ? 'Боль' : 'Pain'}</dt><dd>{pain}</dd></div>
                <div><dt>{language === 'ru' ? 'Что доказывает' : 'Proof'}</dt><dd>{proof}</dd></div>
              </dl>
              <div className={styles.projectFeatures}>
                {features.map((feature) => <span key={feature}>{feature}</span>)}
              </div>
              <figure><ProjectVisual name={name} status={status} /><i /></figure>
              <a href={`${url.startsWith('/') ? import.meta.env.BASE_URL.replace(/\/$/, '') : ''}${url}`} className={styles.projectLink} target={url.startsWith('http') ? '_blank' : undefined} rel={url.startsWith('http') ? 'noreferrer' : undefined}>
                {language === 'ru' ? 'Смотреть кейс' : 'View case'} ↗
              </a>
            </article>
          ))}
        </div>
        <PageContact language={language} />
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

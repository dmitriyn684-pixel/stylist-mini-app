import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './DimkoffPublicSite.module.css';

const PortalIntroScene = lazy(() =>
  import('./DimkoffPortalHero').then((module) => ({
    default: module.DimkoffPortalHero,
  })),
);

type Language = 'ru' | 'en';
type Copy = { ru: string; en: string };

const text = (copy: Copy, language: Language) => copy[language];

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
    image: 'caloriept-ai-live.webp',
    body: {
      ru: 'Telegram AI-продукт для питания и ежедневных сценариев.',
      en: 'A Telegram AI product for nutrition and everyday routines.',
    },
  },
  {
    name: 'Stylist AI',
    status: 'LIVE / FASHION MINI APP',
    image: 'stylist-ai-showcase.webp',
    body: {
      ru: 'Гардероб, палитра и персональная AI-консультация.',
      en: 'Wardrobe, palette and personal AI consultation.',
    },
  },
  {
    name: 'AI Director',
    status: 'CONCEPT / IN DEVELOPMENT',
    image: 'experience-ai-product.webp',
    body: {
      ru: 'Деловой AI-партнёр для первого уровня бизнес-проверки.',
      en: 'A business AI partner for first-line operational review.',
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
              <Link to="/services" key={direction.code}>
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
              <Link to={project.name === 'AI Director' ? '/concepts' : '/projects'} key={project.name}>
                <figure><img src={`${assets}${project.image}`} alt="" loading="lazy" /></figure>
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
        </section>

        <section className={`${styles.homeSection} ${styles.contact}`} id="contact">
          <p>05 / CONTACT</p>
          <h2>{language === 'ru' ? 'Обсудить AI-продукт или Telegram Mini App' : 'Discuss an AI product or Telegram Mini App'}</h2>
          <div>
            <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">Telegram ↗</a>
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
    items: ['AI Director', 'Проверка документов', 'AI-ассистенты', 'Аналитика', 'Recommendations'],
  },
  {
    number: '02',
    title: { ru: 'Telegram Mini Apps', en: 'Telegram Mini Apps' },
    lead: {
      ru: 'Продукт внутри привычного Telegram — без отдельной регистрации и долгого входа.',
      en: 'A product inside familiar Telegram — without a separate registration or long onboarding.',
    },
    items: ['Mini App', 'Telegram-бот', 'Личный кабинет', 'Оплата', 'Уведомления', 'Админка'],
  },
  {
    number: '03',
    title: { ru: 'Digital Experiences', en: 'Digital Experiences' },
    lead: {
      ru: 'Сайты, которые объясняют ценность и создают ощущение продукта без визуального шума.',
      en: 'Sites that communicate value and create a product feeling without visual noise.',
    },
    items: ['3D / WebGL site', 'Premium landing', 'Personal brand site', 'Product launch site'],
  },
  {
    number: '04',
    title: { ru: 'SMM + Growth', en: 'SMM + Growth' },
    lead: {
      ru: 'От упаковки и контента до Telegram-маршрута, прогрева и первых заявок.',
      en: 'From packaging and content to the Telegram journey, warm-up and first leads.',
    },
    items: ['Упаковка', 'Контент', 'Воронка', 'Telegram-маршрут', 'Прогрев', 'Запуск'],
  },
] as const;

const allProjects = [
  ['01', 'CaloriePT AI 2.0', 'LIVE', 'caloriept-ai-live.webp', 'Telegram AI-продукт для питания.', 'Люди, которые считают рацион и формируют привычки.', 'Сложный ежедневный расчёт и повторные действия.', 'Полный цикл AI + Telegram + база продуктов.'],
  ['02', 'Stylist AI', 'LIVE', 'stylist-ai-showcase.webp', 'Персональный стилист внутри Mini App.', 'Пользователи fashion и beauty-сервисов.', 'Выбор образов, палитры и работа с гардеробом.', 'Продуктовую глубину и сложную Mini App-архитектуру.'],
  ['03', 'Psy Mind AI', 'DEMO', 'psy-mind-ai-card.webp', 'AI-продукт для self-reflection.', 'Пользователи бережных психологических сценариев.', 'Регулярная рефлексия между сессиями.', 'Адаптацию AI-продукта под чувствительную нишу.'],
  ['04', 'Businessmen AI', 'DEMO', 'businessmen-ai-card.webp', 'Нишевый AI-ментор.', 'Предприниматели и аудитория бизнес-обучения.', 'Практический разбор бизнес-вопросов.', 'Работу с образовательным продуктом и AI-ролью.'],
  ['05', 'Pulse AI Coach', 'DEMO', 'pulse-ai-coach-card.webp', 'Coaching-продукт для привычек и performance.', 'Люди, которым важны фокус и системные действия.', 'Переход от намерения к повторяемому действию.', 'Широту продуктовой линейки Telegram AI.'],
  ['06', 'Visual Brandbook DimkoFF', 'CASE', 'brandbook-founder-site.webp', 'Визуальная система AI Product Builder.', 'Клиенты, работодатели и партнёры.', 'Единое позиционирование и язык бренда.', 'Связку стратегии, SMM и арт-дирекции.'],
] as const;

const conceptSheets = [
  ['01', 'AI Director', 'CONCEPT / IN DEVELOPMENT', 'Деловой AI-партнёр в Telegram.', 'Собственники малого и среднего бизнеса.', 'Первичная проверка документов, сделок и рисков.', 'AI-проверка, вердикт, красные флаги и следующий шаг.', 'Умение превращать бизнес-риск в понятный AI-сценарий.'],
  ['02', 'ExpertOS', 'CONCEPT', 'Продуктовая среда эксперта.', 'Эксперты, консультанты и авторы методик.', 'Контент, клиенты и методика живут отдельно.', 'Единая среда знаний, контента и сопровождения.', 'Системное мышление вокруг экспертного продукта.'],
  ['03', 'BriefPilot', 'CONCEPT', 'Умный брифинг до созвона.', 'Студии, агентства и B2B-сервисы.', 'Некачественные заявки и потеря времени.', 'Квалификация, сбор вводных и следующий маршрут.', 'Автоматизацию первой точки контакта.'],
  ['04', 'LaunchKit', 'CONCEPT', 'Система быстрого запуска.', 'Эксперты и небольшие команды.', 'Идея не превращается в последовательный запуск.', 'Оффер, контент, воронка и первые заявки.', 'Связку SMM и продуктовой разработки.'],
  ['05', 'Signal House', 'CONCEPT', 'Система сигналов бренда.', 'Личные бренды и новые продукты.', 'Коммуникации не складываются в единый образ.', 'Карта смыслов, контента и точек контакта.', 'Стратегическую работу с брендом.'],
  ['06', 'Signal Field 3D', 'CONCEPT', 'Интерактивная digital-витрина.', 'Бренды, события и premium-продукты.', 'Обычный лендинг не передаёт ощущение продукта.', '3D-сцена, narrative и управляемое внимание.', 'Экспериментальную digital-арт-дирекцию.'],
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
            ? 'Четыре направления, которые можно собрать отдельно или соединить в один запуск.'
            : 'Four directions that can work separately or become one launch.'}
        />
        <div className={styles.serviceSheets}>
          {serviceSections.map((section) => (
            <section key={section.number}>
              <span>{section.number}</span>
              <div>
                <h2>{text(section.title, language)}</h2>
                <p>{text(section.lead, language)}</p>
              </div>
              <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
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
  const assets = `${import.meta.env.BASE_URL}portfolio/assets/`;
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
          {allProjects.map(([number, name, status, image, what, audience, pain, proof]) => (
            <article key={name}>
              <span>{number}</span>
              <div className={styles.projectTitle}><small>{status}</small><h2>{name}</h2></div>
              <dl>
                <div><dt>{language === 'ru' ? 'Что' : 'What'}</dt><dd>{what}</dd></div>
                <div><dt>{language === 'ru' ? 'Для кого' : 'Audience'}</dt><dd>{audience}</dd></div>
                <div><dt>{language === 'ru' ? 'Боль' : 'Pain'}</dt><dd>{pain}</dd></div>
                <div><dt>{language === 'ru' ? 'Что доказывает' : 'Proof'}</dt><dd>{proof}</dd></div>
              </dl>
              <figure><img src={`${assets}${image}`} alt="" loading="lazy" /></figure>
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
        <InnerHero
          eyebrow="03 / CONCEPT LAB"
          title="Product thinking in public"
          lead={language === 'ru'
            ? 'Будущие продуктовые направления. Каждый концепт отделён от реальных работающих проектов.'
            : 'Future product directions. Every concept is clearly separated from live products.'}
        />
        <div className={styles.conceptSheets}>
          {conceptSheets.map(([number, name, status, what, audience, pain, product, proof]) => (
            <article key={name}>
              <header><span>{number}</span><small>{status}</small></header>
              <h2>{name}</h2>
              <dl>
                <div><dt>{language === 'ru' ? 'Что' : 'What'}</dt><dd>{what}</dd></div>
                <div><dt>{language === 'ru' ? 'Для кого' : 'Audience'}</dt><dd>{audience}</dd></div>
                <div><dt>{language === 'ru' ? 'Боль' : 'Pain'}</dt><dd>{pain}</dd></div>
                <div><dt>{language === 'ru' ? 'Продукт' : 'Product'}</dt><dd>{product}</dd></div>
                <div><dt>{language === 'ru' ? 'Что доказывает' : 'Proof'}</dt><dd>{proof}</dd></div>
              </dl>
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
      <p>START / TELEGRAM</p>
      <h2>{language === 'ru' ? 'Есть задача для продукта?' : 'Have a product task?'}</h2>
      <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
        {language === 'ru' ? 'Обсудить проект' : 'Discuss a project'} ↗
      </a>
    </section>
  );
}

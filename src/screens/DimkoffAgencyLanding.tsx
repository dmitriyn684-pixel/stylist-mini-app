import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEventHandler,
} from 'react';
import styles from './DimkoffAgencyLanding.module.css';

type Language = 'ru' | 'en';
type Localized = { ru: string; en: string };

const t = (value: Localized, language: Language) => value[language];

const copy = {
  telegram: { ru: 'Написать в Telegram', en: 'Message on Telegram' },
  discuss: { ru: 'Обсудить проект', en: 'Discuss a project' },
  projects: { ru: 'Смотреть проекты', en: 'View projects' },
  brandbook: { ru: 'Открыть брендбук', en: 'Open brandbook' },
  heroTitle: {
    ru: 'AI-продукты и digital-сцены, которые превращают внимание в систему',
    en: 'AI products and digital scenes that turn attention into a system',
  },
  heroLead: {
    ru: 'DimkoFF соединяет SMM, AI и разработку, чтобы запускать Telegram Mini Apps, AI-ботов, сайты, воронки и продуктовые системы под ключ.',
    en: 'DimkoFF connects SMM, AI and development to launch Telegram Mini Apps, AI bots, websites, funnels and end-to-end product systems.',
  },
  servicesTitle: {
    ru: 'От идеи до работающей digital-системы',
    en: 'From an idea to a working digital system',
  },
  servicesLead: {
    ru: 'Не набор разрозненных подрядчиков, а единая продуктовая логика: смысл, интерфейс, технология и запуск.',
    en: 'Not a collection of disconnected contractors, but one product logic: meaning, interface, technology and launch.',
  },
  projectsTitle: { ru: 'Реальные продукты', en: 'Real products' },
  projectsLead: {
    ru: 'Работающие проекты в разных нишах показывают не один визуальный приём, а способность собирать продукт целиком.',
    en: 'Working products across different niches show the ability to build a complete product, not one visual trick.',
  },
  conceptsTitle: { ru: 'Concept Lab', en: 'Concept Lab' },
  conceptsLead: {
    ru: 'Продуктовая лаборатория направлений, которые можно адаптировать под конкретную бизнес-задачу.',
    en: 'A product lab of directions that can be adapted to a specific business task.',
  },
  experiencesTitle: {
    ru: 'Digital-сцены, которые продают ощущение',
    en: 'Digital scenes that sell the feeling',
  },
  experiencesLead: {
    ru: 'Три направления для брендов, которым недостаточно обычного шаблонного лендинга.',
    en: 'Three directions for brands that need more than a standard template landing page.',
  },
  processTitle: { ru: 'Как собирается продукт', en: 'How the product is built' },
  processLead: {
    ru: 'Сначала смысл и система. Затем интерфейс, быстрый запуск и улучшение по реакции аудитории.',
    en: 'Meaning and system come first. Then interface, a fast launch and improvement through audience response.',
  },
  brandbookTitle: {
    ru: 'DimkoFF Visual Brandbook 2026',
    en: 'DimkoFF Visual Brandbook 2026',
  },
  brandbookLead: {
    ru: 'Позиционирование, визуальная система, digital experiences и направление premium AI product studio — в одном документе.',
    en: 'Positioning, visual system, digital experiences and the premium AI product studio direction in one document.',
  },
  openPdf: { ru: 'Открыть PDF', en: 'Open PDF' },
  viewPortfolio: { ru: 'Смотреть портфолио', en: 'View portfolio' },
  download: { ru: 'Скачать брендбук', en: 'Download brandbook' },
  contactTitle: {
    ru: 'Превратим идею в работающий digital-продукт',
    en: 'Let’s turn the idea into a working digital product',
  },
  contactLead: {
    ru: 'Опишите задачу — от Mini App и AI-бота до 3D-сайта или white-label продукта. В ответ получите реалистичный первый маршрут.',
    en: 'Describe the task — from a Mini App and AI bot to a 3D site or white-label product. You will get a realistic first route.',
  },
} satisfies Record<string, Localized>;

const navItems: Array<{ href: string; label: Localized }> = [
  { href: '#services', label: { ru: 'Услуги', en: 'Services' } },
  { href: '#projects', label: { ru: 'Проекты', en: 'Projects' } },
  { href: '#concepts', label: { ru: 'Концепты', en: 'Concepts' } },
  { href: '#brandbook', label: { ru: 'Брендбук', en: 'Brandbook' } },
  { href: '#contact', label: { ru: 'Контакты', en: 'Contact' } },
];

const services = [
  {
    code: 'AI',
    title: { ru: 'AI-продукты для бизнеса', en: 'AI products for business' },
    body: {
      ru: 'Проверки, рекомендации, аналитика и автоматизация, собранные в понятный пользовательский продукт.',
      en: 'Checks, recommendations, analytics and automation assembled into a clear user product.',
    },
  },
  {
    code: 'TG',
    title: { ru: 'Telegram Mini Apps', en: 'Telegram Mini Apps' },
    body: {
      ru: 'Быстрый вход, личный кабинет, сценарии продаж и повторные действия внутри Telegram.',
      en: 'Fast entry, personal accounts, sales journeys and repeat actions inside Telegram.',
    },
  },
  {
    code: 'EX',
    title: { ru: 'AI-ассистенты для экспертов', en: 'AI assistants for experts' },
    body: {
      ru: 'Продукты для авторов методик, психологов, консультантов, коучей и специалистов.',
      en: 'Products for methodology creators, psychologists, consultants, coaches and experts.',
    },
  },
  {
    code: '3D',
    title: { ru: 'Premium сайты и 3D-витрины', en: 'Premium sites and 3D showcases' },
    body: {
      ru: 'Launch-сайты, digital experiences и сцены, в которых бренд ощущается как продукт.',
      en: 'Launch sites, digital experiences and scenes where the brand feels like a product.',
    },
  },
  {
    code: 'GR',
    title: { ru: 'SMM + Growth Systems', en: 'SMM + Growth Systems' },
    body: {
      ru: 'Оффер, контент, прогрев, Telegram-маршрут, аналитика и первые точки роста.',
      en: 'Offer, content, warm-up, Telegram journey, analytics and first growth points.',
    },
  },
  {
    code: 'BR',
    title: { ru: 'Брендинг и упаковка', en: 'Branding and packaging' },
    body: {
      ru: 'Позиционирование, визуальная система и продуктовый язык для уверенного запуска.',
      en: 'Positioning, visual system and product language for a confident launch.',
    },
  },
] as const;

const projects = [
  {
    name: 'CaloriePT AI 2.0',
    label: 'AI NUTRITION / LIVE',
    image: 'calorie',
    body: {
      ru: 'Telegram AI-продукт для питания, распознавания и ежедневных сценариев.',
      en: 'A Telegram AI product for nutrition, recognition and daily routines.',
    },
  },
  {
    name: 'Stylist AI',
    label: 'FASHION MINI APP / LIVE',
    image: 'stylist',
    body: {
      ru: 'Персональный стилист, гардероб, палитра и AI-консультация внутри Mini App.',
      en: 'A personal stylist, wardrobe, palette and AI consultation inside a Mini App.',
    },
  },
  {
    name: 'Psy Mind AI',
    label: 'PSYCHOLOGY / TELEGRAM',
    image: 'psy',
    body: {
      ru: 'AI-продукт для self-reflection и бережных психологических сценариев.',
      en: 'An AI product for self-reflection and careful psychological journeys.',
    },
  },
  {
    name: 'Businessmen AI',
    label: 'BUSINESS EDUCATION / BOT',
    image: 'business',
    body: {
      ru: 'Нишевый AI-ментор для бизнес-обучения и практических разборов.',
      en: 'A niche AI mentor for business education and practical reviews.',
    },
  },
  {
    name: 'Pulse AI Coach',
    label: 'COACHING / PERFORMANCE',
    image: 'pulse',
    body: {
      ru: 'Coaching-продукт для привычек, фокуса и performance-сценариев.',
      en: 'A coaching product for habits, focus and performance journeys.',
    },
  },
  {
    name: 'Visual Brandbook',
    label: 'VISUAL SYSTEM / 2026',
    image: 'brandbookPreview',
    body: {
      ru: 'Позиционирование и визуальный язык DimkoFF как AI Product Builder.',
      en: 'DimkoFF positioning and visual language as an AI Product Builder.',
    },
  },
] as const;

const concepts = [
  {
    name: 'AI Director',
    status: 'CONCEPT / IN DEVELOPMENT',
    featured: true,
    body: {
      ru: 'Деловой AI-партнёр в Telegram для собственников малого и среднего бизнеса. Помогает проверять договоры, коммерческие предложения, отчёты, сделки, поставщиков, задачи и финансовые риски. Закрывает первый уровень проверки и показывает, где можно потерять деньги.',
      en: 'A business AI partner in Telegram for SME owners. It helps review contracts, proposals, reports, deals, suppliers, tasks and financial risks. It handles the first review layer and highlights where money may be lost.',
    },
  },
  {
    name: 'ExpertOS',
    status: 'CONCEPT',
    body: {
      ru: 'Продуктовая среда для эксперта, контента, методики и клиентов.',
      en: 'A product environment for an expert, content, methodology and clients.',
    },
  },
  {
    name: 'BriefPilot',
    status: 'CONCEPT',
    body: {
      ru: 'Умный брифинг, квалификация заявки и сбор вводных до созвона.',
      en: 'Smart briefing, lead qualification and input collection before a call.',
    },
  },
  {
    name: 'LaunchKit',
    status: 'CONCEPT',
    body: {
      ru: 'Маршрут запуска от оффера и контента до первых заявок.',
      en: 'A launch journey from offer and content to first leads.',
    },
  },
  {
    name: 'Signal House',
    status: 'CONCEPT',
    body: {
      ru: 'Система сигналов бренда, контента и точек контакта.',
      en: 'A system of brand signals, content and touchpoints.',
    },
  },
  {
    name: 'Signal Field 3D',
    status: 'CONCEPT',
    body: {
      ru: 'Интерактивная 3D-витрина для продукта, события или бренда.',
      en: 'An interactive 3D showcase for a product, event or brand.',
    },
  },
] as const;

const experienceCases = [
  {
    label: '01 / PREMIUM HOSPITALITY',
    image: 'hospitality',
    title: { ru: 'Пространства и атмосфера', en: 'Spaces and atmosphere' },
    body: {
      ru: 'Сайты ресторанов, отелей, lounge и клубов, которые ведут к бронированию.',
      en: 'Sites for restaurants, hotels, lounges and clubs that lead to booking.',
    },
  },
  {
    label: '02 / AI PRODUCT LAUNCH',
    image: 'aiProduct',
    title: { ru: 'Запуск AI-продукта', en: 'AI product launch' },
    body: {
      ru: 'Launch-сайты для AI-сервисов, Telegram Mini Apps и SaaS.',
      en: 'Launch sites for AI services, Telegram Mini Apps and SaaS.',
    },
  },
  {
    label: '03 / FOUNDER SITE',
    image: 'personalBrand',
    title: { ru: 'Личный бренд', en: 'Personal brand' },
    body: {
      ru: 'Сайты-платформы для экспертов, предпринимателей и медийных людей.',
      en: 'Platform sites for experts, founders and public figures.',
    },
  },
] as const;

const processSteps = [
  { number: '01', title: { ru: 'Смысл', en: 'Meaning' }, body: { ru: 'Задача, аудитория, ценность', en: 'Task, audience, value' } },
  { number: '02', title: { ru: 'Система', en: 'System' }, body: { ru: 'Логика и маршрут продукта', en: 'Product logic and journey' } },
  { number: '03', title: { ru: 'Интерфейс', en: 'Interface' }, body: { ru: 'Сайт, Telegram и AI-сценарии', en: 'Web, Telegram and AI journeys' } },
  { number: '04', title: { ru: 'Запуск', en: 'Launch' }, body: { ru: 'MVP и первые пользователи', en: 'MVP and first users' } },
  { number: '05', title: { ru: 'Улучшение', en: 'Improve' }, body: { ru: 'Данные, реакция и рост', en: 'Data, response and growth' } },
] as const;

const marqueeItems = [
  'AI PRODUCTS',
  'TELEGRAM MINI APPS',
  'DIGITAL EXPERIENCES',
  'SMM SYSTEMS',
  'BRAND SYSTEMS',
  'AI BOTS',
  'PRODUCT THINKING',
  'FULL CYCLE LAUNCH',
  'AUTOMATION',
  'PREMIUM WEB',
  'CASE LAB',
  'GROWTH SYSTEMS',
];

const projectFormats = [
  'MVP',
  'Telegram Mini App',
  'AI-бот',
  'White-label',
  '3D-сайт',
  'Личный бренд',
  'Партнёрство',
];

function PortalMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path className={styles.markOutline} d="M13 7h18c15.2 0 26 10.2 26 25S46.2 57 31 57H13V7Z" />
      <path className={styles.markVector} d="M14 54 41.5 32 14 10v13.6L25.2 32 14 40.5V54Z" />
      <circle className={styles.markCore} cx="41.5" cy="32" r="2.5" />
    </svg>
  );
}

export function DimkoffAgencyLanding() {
  const [language, setLanguage] = useState<Language>('ru');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const baseUrl = import.meta.env.BASE_URL;

  const links = useMemo(
    () => ({
      portfolio: `${baseUrl}portfolio/`,
      brandbook: `${baseUrl}portfolio/dimkoff-brandbook-2026-visual-v2.pdf`,
      hero: `${baseUrl}portfolio/assets/dimkoff-digital-portal-v3.webp`,
      calorie: `${baseUrl}portfolio/assets/caloriept-ai-live.webp`,
      stylist: `${baseUrl}portfolio/assets/stylist-ai-showcase.webp`,
      psy: `${baseUrl}portfolio/assets/psy-mind-ai-card.webp`,
      business: `${baseUrl}portfolio/assets/businessmen-ai-card.webp`,
      pulse: `${baseUrl}portfolio/assets/pulse-ai-coach-card.webp`,
      brandbookPreview: `${baseUrl}portfolio/assets/brandbook-founder-site.webp`,
      hospitality: `${baseUrl}portfolio/assets/experience-hospitality.webp`,
      aiProduct: `${baseUrl}portfolio/assets/experience-ai-product.webp`,
      personalBrand: `${baseUrl}portfolio/assets/experience-personal-brand.webp`,
    }),
    [baseUrl],
  );

  useEffect(() => {
    const saved = localStorage.getItem('dimkoff-main-language');
    if (saved === 'ru' || saved === 'en') setLanguage(saved);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setLoaderProgress(100);
      setLoaderVisible(false);
      return;
    }
    const startedAt = performance.now();
    let frame = 0;
    const update = (now: number) => {
      const progress = Math.min(100, Math.round(((now - startedAt) / 1550) * 100));
      setLoaderProgress(progress);
      if (progress < 100) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    const leaveTimer = window.setTimeout(() => setLoaderLeaving(true), 1550);
    const removeTimer = window.setTimeout(() => setLoaderVisible(false), 2250);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = loaderVisible ? 'hidden' : previous;
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [loaderVisible]);

  useEffect(() => {
    document.title =
      language === 'ru'
        ? 'DimkoFF — AI-продукты и digital-сцены'
        : 'DimkoFF — AI products and digital scenes';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (loaderVisible) return;
    const elements = [...document.querySelectorAll<HTMLElement>('[data-agency-reveal]')];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = 'true';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [loaderVisible]);

  const chooseLanguage = (next: Language) => {
    setLanguage(next);
    localStorage.setItem('dimkoff-main-language', next);
  };

  const handleTilt: PointerEventHandler<HTMLElement> = (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--agency-rx', `${y * -5}deg`);
    event.currentTarget.style.setProperty('--agency-ry', `${x * 6}deg`);
  };

  const resetTilt: PointerEventHandler<HTMLElement> = (event) => {
    event.currentTarget.style.setProperty('--agency-rx', '0deg');
    event.currentTarget.style.setProperty('--agency-ry', '0deg');
  };

  const handleHeroMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--agency-mx', `${x * 18}px`);
    event.currentTarget.style.setProperty('--agency-my', `${y * 13}px`);
  };

  const resetHero: PointerEventHandler<HTMLDivElement> = (event) => {
    event.currentTarget.style.setProperty('--agency-mx', '0px');
    event.currentTarget.style.setProperty('--agency-my', '0px');
  };

  return (
    <div className={styles.agency} data-testid="dimkoff-main-landing">
      {loaderVisible && (
        <div
          className={`${styles.loader} ${loaderLeaving ? styles.loaderLeaving : ''}`}
          data-testid="dimkoff-loader"
          aria-label="DimkoFF digital system loading"
        >
          <div className={styles.loaderGrid} />
          <div className={styles.loaderIdentity}>
            <PortalMark className={styles.loaderMark} />
            <p>DIMKOFF / DIGITAL SYSTEM</p>
          </div>
          <div className={styles.loaderWord} aria-hidden="true">
            {'DIMKOFF'.split('').map((letter, index) => (
              <span key={`${letter}-${index}`} style={{ '--letter-index': index } as CSSProperties}>{letter}</span>
            ))}
          </div>
          <div className={styles.loaderStatus}>
            <span>AI PRODUCT STUDIO</span>
            <strong>{String(loaderProgress).padStart(3, '0')}</strong>
          </div>
          <div className={styles.loaderProgress}><i style={{ width: `${loaderProgress}%` }} /></div>
        </div>
      )}

      <div className={styles.pageNoise} aria-hidden="true" />
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="DimkoFF">
          <span className={styles.brandMark}><PortalMark /></span>
          <strong>DIMKOFF<span>.</span></strong>
        </a>
        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="agency-nav"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <i /><i /><span>{language === 'ru' ? 'Меню' : 'Menu'}</span>
        </button>
        <nav id="agency-nav" className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {t(item.label, language)}
            </a>
          ))}
          <div className={styles.navMobileActions}>
            <div className={styles.langSwitch}>
              <button type="button" aria-pressed={language === 'ru'} onClick={() => chooseLanguage('ru')}>RU</button>
              <span>/</span>
              <button type="button" aria-pressed={language === 'en'} onClick={() => chooseLanguage('en')}>EN</button>
            </div>
            <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">{t(copy.telegram, language)}</a>
          </div>
        </nav>
        <div className={styles.headerActions}>
          <div className={styles.langSwitch}>
            <button type="button" aria-pressed={language === 'ru'} onClick={() => chooseLanguage('ru')}>RU</button>
            <span>/</span>
            <button type="button" aria-pressed={language === 'en'} onClick={() => chooseLanguage('en')}>EN</button>
          </div>
          <a className={styles.headerCta} href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
            {t(copy.telegram, language)}
          </a>
        </div>
      </header>

      <main>
        <section id="top" className={`${styles.hero} ${styles.shell}`}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}><i /> SMM + AI PRODUCT BUILDER</p>
              <h1>
                <span>{language === 'ru' ? 'AI-продукты' : 'AI products'}</span>
                {language === 'ru'
                  ? ' и digital-сцены, которые превращают внимание в систему'
                  : ' and digital scenes that turn attention into a system'}
              </h1>
            <p className={styles.heroLead}>{t(copy.heroLead, language)}</p>
            <div className={styles.heroActions}>
              <a className={styles.buttonGold} href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
                {t(copy.discuss, language)} <i>↗</i>
              </a>
              <a className={styles.buttonGlass} href="#projects">{t(copy.projects, language)} <i>↓</i></a>
              <a className={styles.buttonText} href={links.brandbook}>{t(copy.brandbook, language)} <i>↗</i></a>
            </div>
            <div className={styles.heroSystem}>
              <span>SIGNAL</span><i>→</i><span>SYSTEM</span><i>→</i><span>PRODUCT</span><i>→</i><span>GROWTH</span>
            </div>
          </div>
          <div className={styles.heroScene} onPointerMove={handleHeroMove} onPointerLeave={resetHero}>
            <div className={styles.sceneGlow} />
            <img src={links.hero} alt="3D-символ DimkoFF — Цифровой портал" width="1672" height="941" fetchPriority="high" />
            <div className={`${styles.orbit} ${styles.orbitOne}`} />
            <div className={`${styles.orbit} ${styles.orbitTwo}`} />
            <div className={styles.lightSweep} />
            <div className={`${styles.signalCard} ${styles.signalCardOne}`}>
              <span>01 / INPUT</span><strong>ATTENTION</strong><small>SMM SIGNAL</small>
            </div>
            <div className={`${styles.signalCard} ${styles.signalCardTwo}`}>
              <span>02 / CORE</span><strong>AI + DEV</strong><small>PRODUCT LOGIC</small>
            </div>
            <div className={styles.sceneCaption}><i /> DIGITAL PORTAL / SYSTEM ONLINE</div>
          </div>
          <div className={styles.scrollHint}><span>SCROLL TO EXPLORE</span><i>↓</i></div>
        </section>

        <div className={styles.marquee} data-testid="seamless-marquee" aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[0, 1, 2].map((group) => (
              <div className={styles.marqueeGroup} key={group}>
                {marqueeItems.map((item) => <span key={`${group}-${item}`}>{item}<i>+</i></span>)}
              </div>
            ))}
          </div>
        </div>

        <section id="services" className={`${styles.section} ${styles.shell}`}>
          <div className={styles.sectionIntro} data-agency-reveal>
            <div><p className={styles.eyebrow}>01 / SERVICES</p><h2>{t(copy.servicesTitle, language)}</h2></div>
            <p>{t(copy.servicesLead, language)}</p>
          </div>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <article
                className={styles.serviceCard}
                key={service.code}
                data-agency-reveal
                onPointerMove={handleTilt}
                onPointerLeave={resetTilt}
              >
                <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>
                <i className={styles.cardArrow}>↗</i>
                <div className={styles.serviceCode}>{service.code}</div>
                <h3>{t(service.title, language)}</h3>
                <p>{t(service.body, language)}</p>
                <div className={styles.cardBeam} />
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className={styles.projectsSection}>
          <div className={styles.shell}>
            <div className={styles.sectionIntro} data-agency-reveal>
              <div><p className={styles.eyebrow}>02 / REAL PRODUCTS</p><h2>{t(copy.projectsTitle, language)}</h2></div>
              <p>{t(copy.projectsLead, language)}</p>
            </div>
            <div className={styles.projectsGrid}>
              {projects.map((project, index) => (
                <article className={`${styles.projectCard} ${index < 2 ? styles.projectFeatured : ''}`} key={project.name} data-agency-reveal>
                  <img src={links[project.image]} alt="" loading="lazy" />
                  <div className={styles.projectShade} />
                  <div className={styles.projectMeta}>
                    <span>{String(index + 1).padStart(2, '0')} / {project.label}</span>
                    <h3>{project.name}</h3>
                    <p>{t(project.body, language)}</p>
                  </div>
                  <a href={`${links.portfolio}#projects`} aria-label={`${project.name} — portfolio`}>↗</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="concepts" className={`${styles.section} ${styles.shell}`}>
          <div className={styles.sectionIntro} data-agency-reveal>
            <div><p className={styles.eyebrow}>03 / PRODUCT LAB</p><h2>{t(copy.conceptsTitle, language)}</h2></div>
            <p>{t(copy.conceptsLead, language)}</p>
          </div>
          <div className={styles.conceptGrid}>
            {concepts.map((concept, index) => (
              <article className={`${styles.conceptCard} ${'featured' in concept && concept.featured ? styles.conceptFeatured : ''}`} key={concept.name} data-agency-reveal>
                <span>{String(index + 1).padStart(2, '0')} / {concept.status}</span>
                <h3>{concept.name}</h3>
                <p>{t(concept.body, language)}</p>
                {'featured' in concept && concept.featured && (
                  <ul>
                    <li>{language === 'ru' ? 'Первичная бизнес-проверка' : 'First-line business review'}</li>
                    <li>{language === 'ru' ? 'Вердикт и риски' : 'Verdict and risks'}</li>
                    <li>{language === 'ru' ? 'Финальное решение принимает собственник' : 'The owner makes the final decision'}</li>
                  </ul>
                )}
                <i>↗</i>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.experienceSection}>
          <div className={styles.shell}>
            <div className={styles.sectionIntro} data-agency-reveal>
              <div><p className={styles.eyebrow}>04 / DIGITAL EXPERIENCES</p><h2>{t(copy.experiencesTitle, language)}</h2></div>
              <p>{t(copy.experiencesLead, language)}</p>
            </div>
            <div className={styles.experienceStage}>
              {experienceCases.map((experience, index) => (
                <article
                  className={`${styles.experienceCard} ${styles[`experience${index + 1}`]}`}
                  key={experience.label}
                  data-agency-reveal
                  onPointerMove={handleTilt}
                  onPointerLeave={resetTilt}
                >
                  <img src={links[experience.image]} alt={t(experience.title, language)} loading="lazy" />
                  <div><span>{experience.label}</span><h3>{t(experience.title, language)}</h3><p>{t(experience.body, language)}</p></div>
                </article>
              ))}
              <svg className={styles.experienceConnections} viewBox="0 0 1200 560" aria-hidden="true">
                <path d="M180 360 C350 220 470 470 600 300 S870 140 1030 300" />
                <circle cx="180" cy="360" r="5" /><circle cx="600" cy="300" r="5" /><circle cx="1030" cy="300" r="5" />
              </svg>
            </div>
            <a className={styles.inlineLink} href={`${links.portfolio}#experiences`}>
              {language === 'ru' ? 'Смотреть Digital Experiences' : 'View Digital Experiences'} <i>↗</i>
            </a>
          </div>
        </section>

        <section id="process" className={`${styles.section} ${styles.shell}`}>
          <div className={styles.sectionIntro} data-agency-reveal>
            <div><p className={styles.eyebrow}>05 / PROCESS</p><h2>{t(copy.processTitle, language)}</h2></div>
            <p>{t(copy.processLead, language)}</p>
          </div>
          <ol className={styles.processGrid}>
            {processSteps.map((step) => (
              <li key={step.number} data-agency-reveal>
                <span>{step.number}</span>
                <strong>{t(step.title, language)}</strong>
                <small>{t(step.body, language)}</small>
                <i />
              </li>
            ))}
          </ol>
        </section>

        <section id="brandbook" className={styles.brandbookSection}>
          <div className={`${styles.shell} ${styles.brandbookLayout}`}>
            <div data-agency-reveal>
              <p className={styles.eyebrow}>06 / VISUAL SYSTEM</p>
              <h2>{t(copy.brandbookTitle, language)}</h2>
              <p>{t(copy.brandbookLead, language)}</p>
              <div className={styles.brandbookActions}>
                <a className={styles.buttonGold} href={links.brandbook}>{t(copy.openPdf, language)} <i>↗</i></a>
                <a className={styles.buttonGlass} href={links.portfolio}>{t(copy.viewPortfolio, language)} <i>↗</i></a>
                <a className={styles.buttonText} href={links.brandbook} download>{t(copy.download, language)} <i>↓</i></a>
              </div>
            </div>
            <a className={styles.brandbookPreview} href={links.brandbook} data-agency-reveal>
              <img src={links.brandbookPreview} alt="DimkoFF Visual Brandbook 2026" loading="lazy" />
              <span>35 PAGES / VISUAL EDITION V2</span>
              <i>OPEN<br />PDF</i>
            </a>
          </div>
        </section>

        <section id="contact" className={`${styles.contactSection} ${styles.shell}`} data-agency-reveal>
          <div className={styles.contactGlow} />
          <p className={styles.eyebrow}>07 / START A PROJECT</p>
          <h2>{t(copy.contactTitle, language)}</h2>
          <p>{t(copy.contactLead, language)}</p>
          <div className={styles.formatList}>
            {projectFormats.map((format) => <span key={format}>{format}</span>)}
          </div>
          <div className={styles.contactGrid}>
            <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer"><span>TELEGRAM</span><strong>@AIStudioDimkoFF</strong><i>↗</i></a>
            <a href="tel:+79999357608"><span>{language === 'ru' ? 'ТЕЛЕФОН' : 'PHONE'}</span><strong>+7 999-935-76-08</strong><i>→</i></a>
          </div>
          <a className={styles.contactButton} href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
            {t(copy.telegram, language)} <i>↗</i>
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div><a className={styles.brand} href="#top"><span className={styles.brandMark}><PortalMark /></span><strong>DIMKOFF<span>.</span></strong></a><p>AI PRODUCTS / TELEGRAM MINI APPS / DIGITAL EXPERIENCES</p></div>
          <nav>{navItems.map((item) => <a href={item.href} key={item.href}>{t(item.label, language)}</a>)}</nav>
          <div className={styles.footerBottom}><span>© 2026 DIMKOFF</span><span>SMM + AI PRODUCT BUILDER</span></div>
        </div>
      </footer>
    </div>
  );
}

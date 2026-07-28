import { useEffect, useMemo, useState, type PointerEventHandler } from 'react';
import styles from './DimkoffLandingScreen.module.css';

type Language = 'ru' | 'en';
type Localized = { ru: string; en: string };

const copy = {
  nav: {
    services: { ru: 'Возможности', en: 'Capabilities' },
    value: { ru: 'Польза', en: 'Business value' },
    products: { ru: 'Продукты', en: 'Products' },
    process: { ru: 'Процесс', en: 'Process' },
    contact: { ru: 'Контакты', en: 'Contact' },
  },
  telegram: { ru: 'Написать в Telegram', en: 'Message on Telegram' },
  heroTitle: {
    ru: 'AI-продукты и Telegram Mini Apps для бизнеса, экспертов и личных брендов',
    en: 'AI products and Telegram Mini Apps for businesses, experts and personal brands',
  },
  heroLead: {
    ru: 'Создаю digital-системы под ключ: от идеи, SMM-упаковки и воронки до AI-бота, Mini App, сайта и запуска.',
    en: 'I build end-to-end digital systems: from idea, SMM packaging and funnel to an AI bot, Mini App, website and launch.',
  },
  discuss: { ru: 'Обсудить проект', en: 'Discuss a project' },
  viewProjects: { ru: 'Смотреть проекты', en: 'View projects' },
  capabilitiesTitle: { ru: 'Что можно собрать', en: 'What we can build' },
  capabilitiesLead: {
    ru: 'Выбираем не модный инструмент, а связку, которая решает бизнес-задачу и приводит пользователя к целевому действию.',
    en: 'We choose the system that solves the business task and moves the user to a meaningful action — not just a trendy tool.',
  },
  valueTitle: {
    ru: 'Не просто сайт. Не просто бот. А рабочая digital-система.',
    en: 'Not just a website. Not just a bot. A working digital system.',
  },
  valueLead: {
    ru: 'SMM создаёт внимание, Telegram сокращает путь, AI автоматизирует, а интерфейс превращает всё это в понятный продукт.',
    en: 'SMM creates attention, Telegram shortens the journey, AI automates, and the interface turns it into a clear product.',
  },
  productsTitle: { ru: 'Продукты и концепты', en: 'Products and concepts' },
  productsLead: {
    ru: 'Работающие продукты показывают delivery. Концепты — направления, которые можно адаптировать под конкретную нишу.',
    en: 'Working products demonstrate delivery. Concepts show directions that can be adapted to a specific niche.',
  },
  real: { ru: 'Реальные продукты', en: 'Real products' },
  concepts: { ru: 'Концепты', en: 'Concepts' },
  portfolio: { ru: 'Смотреть портфолио', en: 'View portfolio' },
  audienceTitle: { ru: 'Для кого', en: 'Who it is for' },
  audienceLead: {
    ru: 'Для команд и экспертов, которым нужен не набор подрядчиков, а единый продуктовый маршрут.',
    en: 'For teams and experts who need a unified product journey instead of disconnected contractors.',
  },
  processTitle: { ru: 'Как работаем', en: 'How we work' },
  processLead: {
    ru: 'Сначала бизнес-смысл, затем интерфейс и технологии. MVP запускается быстро, но остаётся основой для развития.',
    en: 'Business meaning comes first, then interface and technology. The MVP launches fast and remains a foundation for growth.',
  },
  proofTitle: {
    ru: 'Посмотреть визуальную систему и проекты',
    en: 'Explore the visual system and projects',
  },
  proofLead: {
    ru: 'Portfolio показывает реальные продукты и продуктовую широту. Visual Brandbook раскрывает стиль, digital experiences и направление premium AI founder site.',
    en: 'The portfolio shows real products and product breadth. The Visual Brandbook presents the style, digital experiences and premium AI founder site direction.',
  },
  openPortfolio: { ru: 'Открыть портфолио', en: 'Open portfolio' },
  openBrandbook: { ru: 'Открыть брендбук PDF', en: 'Open brandbook PDF' },
  contactTitle: {
    ru: 'Обсудить AI-продукт, сайт или Telegram Mini App',
    en: 'Discuss an AI product, website or Telegram Mini App',
  },
  contactLead: {
    ru: 'Опишите идею или бизнес-задачу. Я помогу превратить её в понятный продуктовый сценарий и предложу реалистичный первый шаг.',
    en: 'Describe the idea or business task. I will turn it into a clear product journey and suggest a realistic first step.',
  },
  footer: {
    ru: 'AI-продукты, Telegram Mini Apps и digital-системы для бизнеса и личных брендов.',
    en: 'AI products, Telegram Mini Apps and digital systems for businesses and personal brands.',
  },
  care: { ru: 'Сделано с вниманием к продукту.', en: 'Made with care for the product.' },
} satisfies Record<string, Localized | Record<string, Localized>>;

const services: Array<{ number: string; title: Localized; body: Localized; icon: string }> = [
  {
    number: '01',
    icon: 'ai',
    title: { ru: 'AI-продукты для бизнеса', en: 'AI products for business' },
    body: {
      ru: 'Telegram-боты, Mini Apps, AI-помощники, проверки документов, аналитика, рекомендации и автоматизация.',
      en: 'Telegram bots, Mini Apps, AI assistants, document checks, analytics, recommendations and automation.',
    },
  },
  {
    number: '02',
    icon: 'telegram',
    title: { ru: 'Telegram Mini Apps', en: 'Telegram Mini Apps' },
    body: {
      ru: 'Приложения внутри Telegram: привычный вход, быстрый запуск, сценарии продаж и личный кабинет.',
      en: 'Apps inside Telegram: familiar entry, fast launch, sales journeys and personal accounts.',
    },
  },
  {
    number: '03',
    icon: 'expert',
    title: { ru: 'AI-ассистенты для экспертов', en: 'AI assistants for experts' },
    body: {
      ru: 'Боты и Mini Apps для нутрициологов, психологов, коучей, консультантов и авторов методик.',
      en: 'Bots and Mini Apps for nutritionists, psychologists, coaches, consultants and methodology creators.',
    },
  },
  {
    number: '04',
    icon: 'web',
    title: { ru: 'Premium сайты и 3D-витрины', en: 'Premium sites and 3D showcases' },
    body: {
      ru: 'Лендинги, личные бренды, launch-сайты продуктов, 3D-сцены и digital experiences.',
      en: 'Landing pages, personal brands, product launch sites, 3D scenes and digital experiences.',
    },
  },
  {
    number: '05',
    icon: 'growth',
    title: { ru: 'SMM + запуск', en: 'SMM + launch' },
    body: {
      ru: 'Упаковка, оффер, контент, воронка, Telegram-маршрут, аналитика и первые заявки.',
      en: 'Packaging, offer, content, funnel, Telegram journey, analytics and first leads.',
    },
  },
];

const benefits: Localized[] = [
  { ru: 'Помогает упаковать идею в продукт', en: 'Turns an idea into a product' },
  { ru: 'Переводит аудиторию из контента в Telegram', en: 'Moves audiences from content to Telegram' },
  { ru: 'Автоматизирует повторяющиеся действия', en: 'Automates repetitive actions' },
  { ru: 'Собирает заявки, данные и обратную связь', en: 'Collects leads, data and feedback' },
  { ru: 'Делает продукт понятным для клиента', en: 'Makes the product clear to the customer' },
  { ru: 'Показывает бизнесу новую точку роста', en: 'Reveals a new growth opportunity' },
];

const realProducts = [
  { name: 'CaloriePT AI 2.0', type: 'AI NUTRITION / LIVE', tone: 'mint' },
  { name: 'Stylist AI', type: 'FASHION MINI APP / BUILD', tone: 'gold' },
  { name: 'AI Bot Portfolio', type: '3 НИШИ / TELEGRAM', tone: 'blue' },
  { name: 'Visual Brandbook', type: '35 PAGES / VISUAL SYSTEM', tone: 'mint' },
];

const conceptProducts = ['AI Director', 'ExpertOS', 'BriefPilot', 'LaunchKit', 'Signal House', 'Signal Field 3D'];

const audiences: Localized[] = [
  { ru: 'Малый и средний бизнес', en: 'Small and medium businesses' },
  { ru: 'Эксперты и консультанты', en: 'Experts and consultants' },
  { ru: 'Фитнес / wellness', en: 'Fitness / wellness' },
  { ru: 'Fashion / beauty', en: 'Fashion / beauty' },
  { ru: 'Онлайн-школы', en: 'Online schools' },
  { ru: 'Telegram-проекты', en: 'Telegram projects' },
  { ru: 'Личные бренды', en: 'Personal brands' },
  { ru: 'Агентства и студии', en: 'Agencies and studios' },
];

const processSteps: Localized[] = [
  { ru: 'Разбираем идею и бизнес-задачу.', en: 'Clarify the idea and business task.' },
  { ru: 'Собираем продуктовую логику.', en: 'Build the product logic.' },
  { ru: 'Проектируем Telegram / сайт / AI-сценарии.', en: 'Design Telegram, web and AI journeys.' },
  { ru: 'Запускаем MVP.', en: 'Launch the MVP.' },
  { ru: 'Улучшаем по реакции аудитории.', en: 'Improve through audience response.' },
];

function localize(value: Localized, language: Language) {
  return value[language];
}

export function DimkoffLandingScreen() {
  const [language, setLanguage] = useState<Language>('ru');
  const [menuOpen, setMenuOpen] = useState(false);
  const baseUrl = import.meta.env.BASE_URL;

  const links = useMemo(
    () => ({
      portfolio: `${baseUrl}portfolio/`,
      brandbook: `${baseUrl}portfolio/dimkoff-brandbook-2026-visual-v2.pdf`,
      hero: `${baseUrl}portfolio/assets/dimkoff-hero-sculpture.webp`,
      brandbookPreview: `${baseUrl}portfolio/assets/brandbook-founder-site.webp`,
      calorie: `${baseUrl}portfolio/assets/caloriept-ai-live.webp`,
      stylist: `${baseUrl}portfolio/assets/stylist-ai-showcase.webp`,
    }),
    [baseUrl],
  );

  useEffect(() => {
    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    document.title =
      language === 'ru'
        ? 'DimkoFF — AI-продукты и Telegram Mini Apps'
        : 'DimkoFF — AI products and Telegram Mini Apps';
    document.documentElement.lang = language;
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
    };
  }, [language]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dimkoff-main-language');
      if (saved === 'en' || saved === 'ru') setLanguage(saved);
    } catch {
      // Russian is the safe default when storage is unavailable.
    }
  }, []);

  const chooseLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    try {
      localStorage.setItem('dimkoff-main-language', nextLanguage);
    } catch {
      // Language still updates for the current session.
    }
  };

  const handleTilt: PointerEventHandler<HTMLElement> = (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--landing-rx', `${y * -5}deg`);
    event.currentTarget.style.setProperty('--landing-ry', `${x * 5}deg`);
  };

  const resetTilt: PointerEventHandler<HTMLElement> = (event) => {
    event.currentTarget.style.setProperty('--landing-rx', '0deg');
    event.currentTarget.style.setProperty('--landing-ry', '0deg');
  };

  const handleHeroMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--landing-mx', `${x * 15}px`);
    event.currentTarget.style.setProperty('--landing-my', `${y * 11}px`);
  };

  const resetHero: PointerEventHandler<HTMLDivElement> = (event) => {
    event.currentTarget.style.setProperty('--landing-mx', '0px');
    event.currentTarget.style.setProperty('--landing-my', '0px');
  };

  const navItems = [
    ['#capabilities', copy.nav.services],
    ['#value', copy.nav.value],
    ['#products', copy.nav.products],
    ['#process', copy.nav.process],
    ['#contact', copy.nav.contact],
  ] as const;

  return (
    <div className={styles.landing} data-testid="dimkoff-main-landing">
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.gridBackground} aria-hidden="true" />

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="DimkoFF">
          <span className={styles.brandMark}>DFF</span>
          <strong>DIMKOFF<span>.</span></strong>
        </a>

        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="dimkoff-main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i /><i /><span>{language === 'ru' ? 'Меню' : 'Menu'}</span>
        </button>

        <nav id="dimkoff-main-nav" className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navItems.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {localize(label, language)}
            </a>
          ))}
          <div className={styles.mobileActions}>
            <div className={styles.languageSwitch} aria-label="Language">
              <button type="button" aria-pressed={language === 'ru'} onClick={() => chooseLanguage('ru')}>RU</button>
              <span>/</span>
              <button type="button" aria-pressed={language === 'en'} onClick={() => chooseLanguage('en')}>EN</button>
            </div>
            <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
              {localize(copy.telegram, language)}
            </a>
          </div>
        </nav>

        <div className={styles.headerActions}>
          <div className={styles.languageSwitch} aria-label="Language">
            <button type="button" aria-pressed={language === 'ru'} onClick={() => chooseLanguage('ru')}>RU</button>
            <span>/</span>
            <button type="button" aria-pressed={language === 'en'} onClick={() => chooseLanguage('en')}>EN</button>
          </div>
          <a className={styles.headerCta} href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
            {localize(copy.telegram, language)}
          </a>
        </div>
      </header>

      <main>
        <section id="top" className={`${styles.hero} ${styles.shell}`}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}><span />SMM + AI PRODUCT BUILDER</p>
            <h1>{localize(copy.heroTitle, language)}</h1>
            <p className={styles.heroLead}>{localize(copy.heroLead, language)}</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
                {localize(copy.discuss, language)} <span>↗</span>
              </a>
              <a className={styles.secondaryButton} href="#products">
                {localize(copy.viewProjects, language)} <span>↓</span>
              </a>
            </div>
            <div className={styles.heroTrust}>
              <span>IDEA</span><i>→</i><span>SMM</span><i>→</i><span>AI</span><i>→</i><span>PRODUCT</span><i>→</i><span>LAUNCH</span>
            </div>
          </div>

          <div
            className={styles.heroScene}
            onPointerMove={handleHeroMove}
            onPointerLeave={resetHero}
            aria-label="DimkoFF digital product scene"
          >
            <div className={styles.heroGlow} aria-hidden="true" />
            <div className={`${styles.orbit} ${styles.orbitOne}`} aria-hidden="true" />
            <div className={`${styles.orbit} ${styles.orbitTwo}`} aria-hidden="true" />
            <svg className={styles.mesh} viewBox="0 0 680 620" aria-hidden="true">
              <path d="M42 164 170 64 306 122 466 46 628 142 650 310 560 504 368 570 186 516 50 366Z" />
              <path d="M42 164 306 122 560 504M170 64 186 516M466 46 368 570M628 142 50 366M170 64 466 46 650 310 368 570 50 366Z" />
              {[['42','164'],['170','64'],['306','122'],['466','46'],['628','142'],['650','310'],['560','504'],['368','570'],['186','516'],['50','366']].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
              ))}
            </svg>
            <img src={links.hero} alt="3D-скульптура DimkoFF" width="1672" height="941" fetchPriority="high" />
            <div className={`${styles.floatingCard} ${styles.cardIdea}`}>
              <span>01 / SIGNAL</span><strong>IDEA → PRODUCT</strong>
              <small>{language === 'ru' ? 'Смысл до инструмента' : 'Meaning before tools'}</small>
            </div>
            <div className={`${styles.floatingCard} ${styles.cardTelegram}`}>
              <span>02 / TELEGRAM</span><strong>MINI APP</strong>
              <small>{language === 'ru' ? 'Короткий путь к действию' : 'A shorter path to action'}</small>
            </div>
            <div className={`${styles.floatingCard} ${styles.cardGrowth}`}>
              <span>03 / GROWTH</span><strong>SMM + DATA</strong>
              <small>{language === 'ru' ? 'Система видит реакцию' : 'The system sees response'}</small>
            </div>
          </div>
        </section>

        <div className={styles.signalLine} aria-hidden="true">
          <div><span>AI PRODUCTS</span><i>+</i><span>TELEGRAM MINI APPS</span><i>+</i><span>SMM SYSTEMS</span><i>+</i><span>DIGITAL EXPERIENCES</span></div>
        </div>

        <section id="capabilities" className={`${styles.section} ${styles.shell}`}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>01 / CAPABILITIES</p><h2>{localize(copy.capabilitiesTitle, language)}</h2></div>
            <p>{localize(copy.capabilitiesLead, language)}</p>
          </div>
          <div className={styles.serviceGrid}>
            {services.map((service) => (
              <article
                key={service.number}
                className={styles.serviceCard}
                onPointerMove={handleTilt}
                onPointerLeave={resetTilt}
              >
                <span className={styles.cardNumber}>{service.number}</span>
                <span className={styles.cardArrow}>↗</span>
                <div className={`${styles.serviceIcon} ${styles[`icon${service.icon[0].toUpperCase()}${service.icon.slice(1)}`]}`} aria-hidden="true"><i /><b /></div>
                <h3>{localize(service.title, language)}</h3>
                <p>{localize(service.body, language)}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="value" className={styles.valueSection}>
          <div className={`${styles.shell} ${styles.valueLayout}`}>
            <div className={styles.valueStatement}>
              <p className={styles.eyebrow}>02 / BUSINESS VALUE</p>
              <h2>{localize(copy.valueTitle, language)}</h2>
              <p>{localize(copy.valueLead, language)}</p>
              <div className={styles.valueSystem} aria-hidden="true">
                <span>CONTENT</span><i>→</i><span>TELEGRAM</span><i>→</i><span>AI</span><i>→</i><span>ACTION</span>
              </div>
            </div>
            <ol className={styles.benefitList}>
              {benefits.map((benefit, index) => (
                <li key={benefit.ru}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{localize(benefit, language)}</strong>
                  <i>+</i>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="products" className={`${styles.section} ${styles.shell}`}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>03 / PROOF & DIRECTION</p><h2>{localize(copy.productsTitle, language)}</h2></div>
            <p>{localize(copy.productsLead, language)}</p>
          </div>

          <p className={styles.groupLabel}><span>A</span>{localize(copy.real, language)}</p>
          <div className={styles.productGrid}>
            {realProducts.map((product, index) => (
              <article key={product.name} className={`${styles.productCard} ${styles[`tone${product.tone[0].toUpperCase()}${product.tone.slice(1)}`]}`}>
                <div>
                  <span>{String(index + 1).padStart(2, '0')} / {product.type}</span>
                  <h3>{product.name}</h3>
                </div>
                {index < 2 && <img src={index === 0 ? links.calorie : links.stylist} alt="" loading="lazy" />}
                <i>↗</i>
              </article>
            ))}
          </div>

          <p className={styles.groupLabel}><span>B</span>{localize(copy.concepts, language)}</p>
          <div className={styles.conceptRail}>
            {conceptProducts.map((product, index) => (
              <article key={product}>
                <span>{String(index + 1).padStart(2, '0')} / CONCEPT</span>
                <strong>{product}</strong>
                <small>{language === 'ru' ? 'Направление для адаптации под нишу' : 'A direction to adapt to a niche'}</small>
              </article>
            ))}
          </div>
          <a className={styles.portfolioButton} href={links.portfolio}>
            {localize(copy.portfolio, language)} <span>↗</span>
          </a>
        </section>

        <section className={styles.audienceSection}>
          <div className={`${styles.shell} ${styles.audienceLayout}`}>
            <div>
              <p className={styles.eyebrow}>04 / AUDIENCE</p>
              <h2>{localize(copy.audienceTitle, language)}</h2>
              <p>{localize(copy.audienceLead, language)}</p>
            </div>
            <div className={styles.audienceGrid}>
              {audiences.map((audience, index) => (
                <span key={audience.ru}><i>{String(index + 1).padStart(2, '0')}</i>{localize(audience, language)}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className={`${styles.section} ${styles.shell}`}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>05 / PROCESS</p><h2>{localize(copy.processTitle, language)}</h2></div>
            <p>{localize(copy.processLead, language)}</p>
          </div>
          <ol className={styles.processGrid}>
            {processSteps.map((step, index) => (
              <li key={step.ru}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{localize(step, language)}</strong>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.proofSection}>
          <div className={`${styles.shell} ${styles.proofLayout}`}>
            <div>
              <p className={styles.eyebrow}>06 / PORTFOLIO & BRANDBOOK</p>
              <h2>{localize(copy.proofTitle, language)}</h2>
              <p>{localize(copy.proofLead, language)}</p>
              <div className={styles.proofActions}>
                <a className={styles.primaryButton} href={links.portfolio}>{localize(copy.openPortfolio, language)} <span>↗</span></a>
                <a className={styles.secondaryButton} href={links.brandbook}>{localize(copy.openBrandbook, language)} <span>↗</span></a>
              </div>
            </div>
            <a className={styles.proofPreview} href={links.brandbook}>
              <img src={links.brandbookPreview} alt="DimkoFF Visual Brandbook preview" loading="lazy" />
              <span>35 PAGES / VISUAL EDITION V2</span>
              <i>OPEN<br />PDF</i>
            </a>
          </div>
        </section>

        <section id="contact" className={`${styles.contactSection} ${styles.shell}`}>
          <div className={styles.contactGlow} aria-hidden="true" />
          <p className={styles.eyebrow}>07 / START A PROJECT</p>
          <h2>{localize(copy.contactTitle, language)}</h2>
          <p>{localize(copy.contactLead, language)}</p>
          <div className={styles.contactActions}>
            <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
              <span>TELEGRAM</span><strong>@AIStudioDimkoFF</strong><i>↗</i>
            </a>
            <a href="tel:+79999357608">
              <span>{language === 'ru' ? 'ТЕЛЕФОН' : 'PHONE'}</span><strong>+7 999-935-76-08</strong><i>→</i>
            </a>
          </div>
          <a className={styles.contactButton} href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
            {localize(copy.telegram, language)} <span>↗</span>
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div>
            <a className={styles.brand} href="#top">
              <span className={styles.brandMark}>DFF</span>
              <strong>DIMKOFF<span>.</span></strong>
            </a>
            <p>{localize(copy.footer, language)}</p>
          </div>
          <nav>
            <a href={links.portfolio}>{localize(copy.portfolio, language)}</a>
            <a href={links.brandbook}>Visual Brandbook</a>
            <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">Telegram</a>
            <a href={`${baseUrl}app`}>Stylist AI App</a>
          </nav>
          <div className={styles.footerBottom}><span>© 2026 DIMKOFF</span><span>{localize(copy.care, language)}</span></div>
        </div>
      </footer>
    </div>
  );
}

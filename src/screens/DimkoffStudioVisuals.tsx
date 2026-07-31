import styles from './DimkoffStudioVisuals.module.css';

type Language = 'ru' | 'en';

export function ServiceMotionStage({ language }: { language: Language }) {
  return (
    <section className={styles.serviceStage} aria-label={language === 'ru' ? 'Система услуг' : 'Service system'}>
      <div className={styles.serviceGlow} />
      <div className={styles.serviceCore}>
        <span>DFF / SYSTEM</span>
        <strong>{language === 'ru' ? 'ОДНА СИСТЕМА' : 'ONE SYSTEM'}</strong>
        <i />
      </div>
      {[
        ['AI / INTELLIGENCE', '01'],
        ['TELEGRAM / PRODUCT', '02'],
        ['WEBGL / EXPERIENCE', '03'],
        ['SMM / GROWTH', '04'],
      ].map(([label, number], index) => (
        <div className={`${styles.servicePanel} ${styles[`servicePanel${index + 1}`]}`} key={label}>
          <small>{number}</small>
          <b>{label}</b>
          <span><i /><i /><i /></span>
        </div>
      ))}
      <div className={styles.serviceOrbit} />
      <p>
        {language === 'ru'
          ? 'Стратегия → интерфейс → AI → запуск'
          : 'Strategy → interface → AI → launch'}
      </p>
    </section>
  );
}

export function ConceptSignalField({ language }: { language: Language }) {
  return (
    <section className={styles.signalField} data-testid="concept-signal-field">
      <div className={styles.signalArchitecture} aria-hidden="true">
        <div className={styles.architecturePlane}><i /><i /><i /><i /></div>
        <div className={styles.architectureCore}>
          <small>DFF / PRODUCT LOGIC</small>
          <strong>SIGNAL<br />TO SYSTEM</strong>
          <span />
        </div>
        <div className={styles.architectureStripA} />
        <div className={styles.architectureStripB} />
        <div className={styles.architectureTrace}><i /><i /><i /><i /><i /></div>
      </div>
      <div className={`${styles.signalPanel} ${styles.signalPanelA}`}>
        <small>PRODUCT SIGNAL / 01</small>
        <strong>AI DIRECTOR</strong>
        <span>RISK → VERDICT → NEXT STEP</span>
      </div>
      <div className={`${styles.signalPanel} ${styles.signalPanelB}`}>
        <small>KNOWLEDGE LAYER / 02</small>
        <strong>EXPERT OS</strong>
        <span>METHOD → CONTENT → CLIENT</span>
      </div>
      <div className={`${styles.signalPanel} ${styles.signalPanelC}`}>
        <small>EXPERIENCE / 03</small>
        <strong>SIGNAL FIELD</strong>
        <span>SPACE → STORY → ATTENTION</span>
      </div>
      <div className={styles.signalCopy}>
        <p>03 / CONCEPT LAB</p>
        <h1>{language === 'ru' ? 'Лаборатория продуктовых сигналов' : 'Product signal laboratory'}</h1>
        <span>
          {language === 'ru'
            ? 'Здесь идеи становятся понятной логикой, интерфейсом и будущим продуктом.'
            : 'Here ideas become clear logic, interfaces and future products.'}
        </span>
      </div>
      <div className={styles.signalGrid} aria-hidden="true" />
    </section>
  );
}

export function SignalPortal({ language }: { language: Language }) {
  return (
    <div className={styles.contactPortal} aria-hidden="true">
      <div className={styles.contactRing}><i /><i /><i /></div>
      <div className={styles.contactCore}>
        <small>DFF</small>
        <strong>{language === 'ru' ? 'СИГНАЛ ПРИНЯТ' : 'SIGNAL READY'}</strong>
      </div>
    </div>
  );
}

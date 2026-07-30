import styles from './ProjectVisual.module.css';

type ProjectVisualProps = {
  name: string;
  status: string;
  compact?: boolean;
};

const projectMeta: Record<string, { type: string; accent: string; metric: string; detail: string }> = {
  'CaloriePT AI 2.0': { type: 'TELEGRAM MINI APP', accent: 'CALORIES', metric: '1 480 / 2 100', detail: 'P 92 · F 54 · C 168' },
  'Stylist AI': { type: 'FASHION AI', accent: 'YOUR LOOK', metric: 'WARDROBE / 24', detail: 'PALETTE · OUTFITS · AI STYLIST' },
  'AI Director': { type: 'B2B AI TOOL', accent: 'RISK VERDICT', metric: '67 / 100', detail: 'SIGN AFTER REVISION' },
  'Psy Mind AI': { type: 'SELF-REFLECTION', accent: 'MOOD SIGNAL', metric: 'CALM / 74', detail: 'DAILY REFLECTION · 08:30' },
  'Businessmen AI': { type: 'AI MENTOR', accent: 'ACTION PLAN', metric: '03 STEPS', detail: 'FOCUS · FRAMEWORK · DECISION' },
  'Pulse AI Coach': { type: 'PERFORMANCE', accent: 'PULSE SCORE', metric: '86 / 100', detail: 'STREAK 12 · FOCUS 78%' },
  'Visual Brandbook DimkoFF': { type: 'VISUAL SYSTEM', accent: 'DIMKOFF 2026', metric: '28 PAGES', detail: 'IDENTITY · DIGITAL · MOTION' },
};

export function ProjectVisual({ name, status, compact = false }: ProjectVisualProps) {
  const meta = projectMeta[name] ?? {
    type: 'DIGITAL PRODUCT',
    accent: name.toUpperCase(),
    metric: 'SYSTEM / LIVE',
    detail: 'AI · PRODUCT · EXPERIENCE',
  };
  const visualKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className={`${styles.visual} ${compact ? styles.compact : ''}`} data-project={visualKey}>
      <div className={styles.noise} />
      <div className={styles.topline}>
        <span>{meta.type}</span>
        <small>{status}</small>
      </div>
      <div className={styles.device}>
        <div className={styles.deviceHead}><i /><span>DFF / PRODUCT</span><b>•••</b></div>
        <div className={styles.interface}>
          <div className={styles.ring}><strong>{meta.metric}</strong><span>{meta.accent}</span></div>
          <div className={styles.data}>
            <span><i />AI SIGNAL</span>
            <strong>{name}</strong>
            <p>{meta.detail}</p>
            <div><i /><i /><i /></div>
          </div>
        </div>
      </div>
      <div className={styles.badges}><span>AI</span><span>TELEGRAM</span><span>PRODUCT</span></div>
      <div className={styles.reflection} />
    </div>
  );
}

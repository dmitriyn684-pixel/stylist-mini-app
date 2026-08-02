import './ProjectCaseCard.css';

export type ProjectVisualVariant = 'calorie' | 'stylist' | 'psy' | 'business' | 'director' | 'brandbook';

type ProjectCaseCardProps = {
  title: string;
  category: string;
  status: string;
  intro: string;
  problem: string;
  solution: string;
  model: string[];
  visual: ProjectVisualVariant;
  note?: string;
  ctas?: { label: string; href: string }[];
};

export function ProjectCaseCard({ title, category, status, intro, problem, solution, model, visual, note, ctas = [] }: ProjectCaseCardProps) {
  return (
    <article className="projectCaseCard" data-project-case={visual}>
      <div className="projectCaseCard__content">
        <div className="projectCaseCard__meta"><span>{category}</span><span>{status}</span></div>
        <h3>{title}</h3>
        <p className="projectCaseCard__intro">{intro}</p>
        <div className="projectCaseCard__grid">
          <div><strong>Проблема</strong><p>{problem}</p></div>
          <div><strong>Решение</strong><p>{solution}</p></div>
        </div>
        {note && <p className="projectCaseCard__note">{note}</p>}
        <div className="projectCaseCard__model"><strong>Бизнес-модель</strong><ul>{model.map((item) => <li key={item}>{item}</li>)}</ul></div>
        {!!ctas.length && <div className="projectCaseCard__actions">{ctas.map((cta) => <a key={cta.href} className="projectCaseCard__cta" href={cta.href} target={cta.href.startsWith('http') || cta.href.endsWith('.pdf') ? '_blank' : undefined} rel="noreferrer">{cta.label} ↗</a>)}</div>}
      </div>
      <ProjectCaseVisual variant={visual} />
    </article>
  );
}

function ProjectCaseVisual({ variant }: { variant: ProjectVisualVariant }) {
  const labels: Record<ProjectVisualVariant, string[]> = {
    calorie: ['84%', 'AI DAY', 'FRIDGE'], stylist: ['LOOK 04', 'PALETTE', 'WARDROBE'], psy: ['CALM', 'REFLECT', 'ENERGY'], business: ['STRATEGY', 'NEXT STEP', 'GROWTH'], director: ['RISK 02', 'SOURCES 08', 'ACTION'], brandbook: ['BRANDBOOK', 'VISUAL', 'INVESTOR'],
  };
  return (
    <div className={`projectCaseVisual projectCaseVisual--${variant}`} aria-hidden="true">
      <div className="projectCaseVisual__orb" />
      {variant === 'brandbook' ? (
        <div className="brandbookPages"><span><b>DFF</b><i>BRAND SYSTEM</i></span><span><b>2026</b><i>VISUAL GUIDELINE</i></span><span><b>AI</b><i>INVESTOR PACK</i></span><span><b>STUDIO</b><i>PRODUCT LINE</i></span></div>
      ) : (
        <div className="projectCaseVisual__device">
          <div className="projectCaseVisual__top" />
          <small>{labels[variant][0]}</small>
          <div className="projectCaseVisual__hero"><i /><b>{labels[variant][1]}</b></div>
          <div className="projectCaseVisual__cards"><span /><span /><span /></div>
          <em>{labels[variant][2]}</em>
        </div>
      )}
      {variant === 'director' && <div className="riskPanel"><strong>Money at risk</strong><b>₽ 480K</b><span>8 sources found</span></div>}
      <div className="projectCaseVisual__badges">{labels[variant].map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

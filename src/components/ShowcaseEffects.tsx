import { useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import './ShowcaseEffects.css';

export type ShowcaseEffectVariant =
  | 'editorialList'
  | 'darkServiceLayers'
  | 'glassMotion'
  | 'hoverSpaceCards';

type ShowcaseItem = {
  title: string;
  label?: string;
  description?: string;
};

type ShowcaseEffectsProps = {
  variant: ShowcaseEffectVariant;
  eyebrow?: string;
  title: string;
  subtitle: string;
  items?: ShowcaseItem[];
};

export function ShowcaseEffect({
  variant,
  eyebrow,
  title,
  subtitle,
  items = [],
}: ShowcaseEffectsProps) {
  if (variant === 'editorialList') {
    return (
      <section className="showcaseEffect showcaseEffect--editorial" data-showcase-effect={variant}>
        <EffectHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="editorialRows">
          {items.map((item, index) => (
            <article className="editorialRow" key={item.title}>
              <span className="editorialRow__index">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
              {item.label && <span className="editorialRow__label">{item.label}</span>}
              <div className="editorialRow__preview" aria-hidden="true"><span /><span /><span /></div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === 'darkServiceLayers') {
    return (
      <section className="showcaseEffect showcaseEffect--darkLayers" data-showcase-effect={variant}>
        <div className="darkLayers__orb darkLayers__orb--one" />
        <div className="darkLayers__orb darkLayers__orb--two" />
        <EffectHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="layerStack">
          {items.map((item, index) => (
            <article className="layerCard" key={item.title} style={{ '--i': index } as CSSProperties}>
              <span>{item.label || `Layer ${index + 1}`}</span>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === 'glassMotion') {
    return (
      <section className="showcaseEffect showcaseEffect--glassMotion" data-showcase-effect={variant}>
        <div className="glassMotion__shine" />
        <EffectHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="motionStrips">
          {items.map((item, index) => (
            <div className="motionStrip" key={item.title}>
              <span>{item.label || String(index + 1).padStart(2, '0')}</span>
              <strong>{item.title}</strong>
              {item.description && <em>{item.description}</em>}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="showcaseEffect showcaseEffect--hoverCards" data-showcase-effect={variant}>
      <EffectHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="spaceCards">
        {items.map((item, index) => <HoverSpaceCard key={item.title} item={item} index={index} />)}
      </div>
    </section>
  );
}

function EffectHead({ eyebrow, title, subtitle }: Pick<ShowcaseEffectsProps, 'eyebrow' | 'title' | 'subtitle'>) {
  return (
    <div className="showcaseEffect__head">
      {eyebrow && <span className="showcaseEffect__eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function HoverSpaceCard({ item, index }: { item: ShowcaseItem; index: number }) {
  const ref = useRef<HTMLElement | null>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  function onMove(event: MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setStyle({ transform: `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-8px)` });
  }

  return (
    <article
      ref={ref}
      className="spaceCard"
      style={{ ...style, '--i': index } as CSSProperties}
      onMouseMove={onMove}
      onMouseLeave={() => setStyle({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)' })}
    >
      <div className="spaceCard__glow" />
      <span>{item.label || `0${index + 1}`}</span>
      <h3>{item.title}</h3>
      {item.description && <p>{item.description}</p>}
    </article>
  );
}

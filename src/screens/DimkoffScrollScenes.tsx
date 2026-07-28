import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import styles from './DimkoffScrollScenes.module.css';

type Language = 'ru' | 'en';

type SceneProps = {
  language: Language;
  baseUrl: string;
};

type Seed = {
  position: THREE.Vector3;
  scatter: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  phase: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smooth = (value: number) => {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
};

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makeDSeeds(count: number, seed = 684): Seed[] {
  const random = seededRandom(seed);
  const result: Seed[] = [];
  let attempts = 0;

  while (result.length < count && attempts < count * 90) {
    attempts += 1;
    const x = -1.45 + random() * 3;
    const y = -2.05 + random() * 4.1;
    const outer = ((x + 0.35) / 1.72) ** 2 + (y / 2.08) ** 2 <= 1;
    const inner = ((x + 0.25) / 0.82) ** 2 + (y / 1.12) ** 2 < 1;
    const stem = x < -0.92 && Math.abs(y) < 2.03;
    if (!(stem || (outer && !inner && x > -1.18))) continue;

    const z = (random() - 0.5) * 0.72;
    const direction = new THREE.Vector3(
      x * (1.1 + random() * 0.9) + (random() - 0.5) * 2.5,
      y * (0.8 + random() * 1.1) + (random() - 0.5) * 2.1,
      (random() - 0.5) * 8,
    ).normalize();

    result.push({
      position: new THREE.Vector3(x, y, z),
      scatter: direction.multiplyScalar(3 + random() * 5.5),
      rotation: new THREE.Euler(
        random() * Math.PI,
        random() * Math.PI,
        random() * Math.PI,
      ),
      scale: 0.075 + random() * 0.145,
      phase: random() * Math.PI * 2,
    });
  }

  return result;
}

function useSectionProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const distance = Math.max(1, bounds.height - window.innerHeight);
      setProgress(clamp(-bounds.top / distance));
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [ref]);

  return progress;
}

function useSceneActive(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '18% 0px 18% 0px', threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return active;
}

function CrystalD({
  progress,
  shatter = false,
}: {
  progress: number;
  shatter?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { size } = useThree();
  const count = size.width < 640 ? (shatter ? 190 : 125) : shatter ? 380 : 180;
  const seeds = useMemo(
    () => makeDSeeds(count, shatter ? 2026 : 684),
    [count, shatter],
  );
  const helper = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!mesh.current) return;
    const graphite = new THREE.Color('#8fa3a0');
    const mint = new THREE.Color('#4ee0c2');
    const gold = new THREE.Color('#ddb969');
    seeds.forEach((seed, index) => {
      const color =
        index % 13 === 0 ? gold : index % 4 === 0 ? mint : graphite;
      mesh.current?.setColorAt(index, color);
      helper.position.copy(seed.position);
      helper.rotation.copy(seed.rotation);
      helper.scale.setScalar(seed.scale);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [helper, seeds]);

  useFrame((state) => {
    if (!group.current || !mesh.current) return;
    const time = state.clock.elapsedTime;
    const explosion = shatter ? smooth((progress - 0.18) / 0.72) : 0;
    group.current.rotation.y =
      Math.sin(time * (shatter ? 0.17 : 0.22)) * (shatter ? 0.34 : 0.42) +
      progress * (shatter ? 0.24 : 0.34);
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.12 + Math.sin(time * 0.35) * 0.035,
      0.045,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      -state.pointer.x * 0.08,
      0.04,
    );

    seeds.forEach((seed, index) => {
      const pulse = Math.sin(time * 0.8 + seed.phase) * 0.025;
      helper.position
        .copy(seed.position)
        .addScaledVector(seed.scatter, explosion);
      helper.position.z += Math.sin(time * 0.55 + seed.phase) * 0.08;
      helper.rotation.set(
        seed.rotation.x + time * 0.08 + explosion * seed.phase,
        seed.rotation.y + time * 0.13 + explosion * seed.phase * 1.4,
        seed.rotation.z + time * 0.06 + explosion * seed.phase * 0.7,
      );
      const scale = seed.scale * (1 + pulse) * (1 - explosion * 0.18);
      helper.scale.setScalar(scale);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} scale={shatter ? [1.08, 1.08, 1.08] : [1.34, 1.16, 1.18]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, seeds.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshPhongMaterial
          vertexColors
          flatShading
          shininess={150}
          specular="#ffffff"
          emissive="#233e39"
          emissiveIntensity={0.55}
        />
      </instancedMesh>
      {!shatter && (
        <>
          <mesh rotation={[Math.PI / 2.45, 0.3, 0]}>
            <torusGeometry args={[2.65, 0.014, 8, 128]} />
            <meshBasicMaterial color="#19e6bd" transparent opacity={0.55} />
          </mesh>
          <mesh rotation={[Math.PI / 2.1, -0.35, Math.PI / 2]}>
            <torusGeometry args={[2.28, 0.009, 8, 128]} />
            <meshBasicMaterial color="#e8c56e" transparent opacity={0.38} />
          </mesh>
        </>
      )}
    </group>
  );
}

function DiamondDust({ progress }: { progress: number }) {
  const points = useRef<THREE.Points>(null);
  const count = 1500;
  const base = useMemo(() => {
    const random = seededRandom(77);
    const positions = new Float32Array(count * 3);
    const directions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 0.45 + random() * 2.25;
      positions[index * 3] = Math.cos(angle) * radius * 0.7;
      positions[index * 3 + 1] = (random() - 0.5) * 3.8;
      positions[index * 3 + 2] = (random() - 0.5) * 0.8;
      directions[index * 3] = (random() - 0.5) * 8;
      directions[index * 3 + 1] = (random() - 0.5) * 6;
      directions[index * 3 + 2] = (random() - 0.5) * 8;
    }
    return { positions, directions };
  }, []);

  const rendered = useMemo(() => new Float32Array(base.positions), [base]);

  useFrame((state) => {
    if (!points.current) return;
    const explosion = smooth((progress - 0.18) / 0.72);
    const attribute = points.current.geometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute;
    for (let index = 0; index < count * 3; index += 1) {
      rendered[index] =
        base.positions[index] +
        base.directions[index] * explosion +
        Math.sin(state.clock.elapsedTime + index * 0.013) * 0.015;
    }
    attribute.array = rendered;
    attribute.needsUpdate = true;
    points.current.rotation.y = state.clock.elapsedTime * 0.035;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[rendered, 3]}
          count={count}
          array={rendered}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#dffcf7"
        size={0.06}
        transparent
        opacity={0.82}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function PortalCanvas({
  progress,
  shatter = false,
  active,
}: {
  progress: number;
  shatter?: boolean;
  active: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.55]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, shatter ? 7.3 : 6.8], fov: 42 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
    >
      <ambientLight intensity={shatter ? 1.35 : 1.05} />
      <directionalLight position={[4, 5, 6]} intensity={6.5} color="#effffb" />
      <pointLight position={[-4, -2, 3]} intensity={18} color="#12e5b9" />
      <pointLight position={[4, 1, 2]} intensity={15} color="#dcb659" />
      <CrystalD progress={progress} shatter={shatter} />
      {shatter && <DiamondDust progress={progress} />}
    </Canvas>
  );
}

export function PortalIntroScene({ language, baseUrl }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const active = useSceneActive(sectionRef);
  const switched = progress > 0.075;

  return (
    <section
      id="top"
      ref={sectionRef}
      className={styles.introSection}
      data-testid="portal-intro-scene"
      style={{ '--scene-progress': progress } as CSSProperties}
    >
      <div className={styles.stickyViewport}>
        <img
          className={styles.canvasFallback}
          src={`${baseUrl}portfolio/assets/dimkoff-digital-portal-v3.webp`}
          alt=""
          width="1672"
          height="941"
        />
        <div className={styles.canvasLayer}>
          <PortalCanvas progress={progress} active={active} />
        </div>
        <div className={styles.sceneMesh} aria-hidden="true" />
        <div className={styles.introTitle}>
          <p>00 / DIGITAL PORTAL</p>
          <div className={styles.titleSwitcher}>
            <h1 className={!switched ? styles.titleActive : styles.titleAway}>
              DIMKOFF
            </h1>
            <h2 className={switched ? styles.titleActive : styles.titleAway}>
              {language === 'ru'
                ? 'SMM + AI PRODUCT BUILDER'
                : 'SMM + AI PRODUCT BUILDER'}
            </h2>
          </div>
          <span>
            {language === 'ru'
              ? 'Создаю AI-продукты, Telegram Mini Apps и digital-системы под ключ.'
              : 'Building AI products, Telegram Mini Apps and complete digital systems.'}
          </span>
        </div>
        <div className={styles.introActions}>
          <a
            href="https://t.me/AIStudioDimkoFF"
            target="_blank"
            rel="noreferrer"
          >
            {language === 'ru' ? 'Обсудить проект' : 'Discuss a project'} ↗
          </a>
          <a href="#services">
            {language === 'ru' ? 'Смотреть систему' : 'Explore the system'} ↓
          </a>
        </div>
        <div className={styles.sceneReadout}>
          <span>DIGITAL PORTAL / ONLINE</span>
          <strong>{String(Math.round(progress * 100)).padStart(3, '0')}</strong>
        </div>
      </div>
    </section>
  );
}

export function CrystalShatterScene({ language }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const active = useSceneActive(sectionRef);
  const stage =
    progress < 0.22 ? 0 : progress < 0.52 ? 1 : progress < 0.82 ? 2 : 3;
  const words = ['SIGNAL', 'SYSTEM', 'PRODUCT', 'GROWTH'];

  return (
    <section
      ref={sectionRef}
      className={styles.shatterSection}
      data-testid="crystal-shatter-scene"
      style={{ '--scene-progress': progress } as CSSProperties}
    >
      <div className={styles.stickyViewport}>
        <div className={styles.canvasLayer}>
          <PortalCanvas progress={progress} shatter active={active} />
        </div>
        <div className={styles.shatterCopy}>
          <p>01 / TRANSFORMATION</p>
          <h2>{words[stage]}</h2>
          <span>
            {language === 'ru'
              ? 'Одна идея раскрывается в систему касаний, интерфейсов и действий.'
              : 'One idea unfolds into a system of touchpoints, interfaces and actions.'}
          </span>
        </div>
        <div className={styles.shatterCounter}>
          <span>CRYSTAL FIELD</span>
          <strong>{Math.round(1500 * progress).toLocaleString('ru-RU')}</strong>
        </div>
      </div>
    </section>
  );
}

const phoneScreens = [
  {
    name: 'CaloriePT AI',
    label: 'AI NUTRITION',
    asset: 'caloriept-ai-live.webp',
  },
  {
    name: 'Stylist AI',
    label: 'FASHION MINI APP',
    asset: 'stylist-ai-showcase.webp',
  },
  {
    name: 'Psy Mind AI',
    label: 'PSYCHOLOGY BOT',
    asset: 'psy-mind-ai-card.webp',
  },
] as const;

function PhoneFrame({
  className,
  baseUrl,
  active = 0,
}: {
  className: string;
  baseUrl: string;
  active?: number;
}) {
  return (
    <div className={`${styles.phone} ${className}`}>
      <div className={styles.phoneSpeaker} />
      <div className={styles.phoneScreen}>
        {phoneScreens.map((screen, index) => (
          <img
            key={screen.name}
            className={index === active ? styles.phoneScreenActive : ''}
            src={`${baseUrl}portfolio/assets/${screen.asset}`}
            alt={screen.name}
            loading="lazy"
          />
        ))}
      </div>
      <i className={styles.phoneReflection} />
    </div>
  );
}

export function PhoneShowcaseScene({ language, baseUrl }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const active = Math.min(2, Math.floor(progress * 3.05));
  const rise = 1 - smooth(progress / 0.42);
  const turn =
    progress < 0.62
      ? -64 + smooth(progress / 0.62) * 64
      : smooth((progress - 0.62) / 0.38) * 18;

  return (
    <section
      ref={sectionRef}
      className={styles.phoneSection}
      data-testid="phone-showcase-scene"
    >
      <div className={styles.stickyViewport}>
        <div className={styles.phoneHeading}>
          <p>02 / PRODUCTS IN MOTION</p>
          <h2>
            {language === 'ru'
              ? 'Продукты, которые живут внутри Telegram'
              : 'Products that live inside Telegram'}
          </h2>
        </div>
        <PhoneFrame
          className={styles.phoneLeft}
          baseUrl={baseUrl}
          active={0}
        />
        <PhoneFrame
          className={styles.phoneRight}
          baseUrl={baseUrl}
          active={1}
        />
        <div
          className={styles.phoneCenterWrap}
          style={
            {
              '--phone-rise': `${rise * 68}vh`,
              '--phone-turn': `${turn}deg`,
              '--phone-scale': 0.82 + smooth(progress / 0.5) * 0.18,
            } as CSSProperties
          }
        >
          <PhoneFrame
            className={styles.phoneCenter}
            baseUrl={baseUrl}
            active={active}
          />
        </div>
        <div className={styles.phoneMeta}>
          <span>{phoneScreens[active].label}</span>
          <strong>{phoneScreens[active].name}</strong>
          <small>
            {language === 'ru'
              ? 'Прокрутка управляет центральным устройством'
              : 'Scroll controls the central device'}
          </small>
        </div>
      </div>
    </section>
  );
}

const stackCards = [
  {
    code: 'SIGNAL',
    ru: 'Находим идею, аудиторию и реальную точку роста.',
    en: 'Find the idea, audience and real growth point.',
    asset: 'experience-personal-brand.webp',
  },
  {
    code: 'SYSTEM',
    ru: 'Связываем контент, воронку, Telegram и продуктовую логику.',
    en: 'Connect content, funnel, Telegram and product logic.',
    asset: 'brandbook-founder-site.webp',
  },
  {
    code: 'PRODUCT',
    ru: 'Собираем AI-бота, Mini App, сайт или digital-сервис.',
    en: 'Build an AI bot, Mini App, website or digital service.',
    asset: 'experience-ai-product.webp',
  },
  {
    code: 'LAUNCH',
    ru: 'Запускаем MVP и приводим первых пользователей.',
    en: 'Launch the MVP and bring in the first users.',
    asset: 'caloriept-ai-live.webp',
  },
  {
    code: 'GROWTH',
    ru: 'Улучшаем систему по данным и реакции аудитории.',
    en: 'Improve the system through data and audience response.',
    asset: 'stylist-ai-showcase.webp',
  },
] as const;

export function CardStackScene({ language, baseUrl }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);

  return (
    <section
      ref={sectionRef}
      className={styles.stackSection}
      data-testid="card-stack-scene"
    >
      <div className={styles.stickyViewport}>
        <div className={styles.stackHeading}>
          <p>03 / ONE SYSTEM</p>
          <h2>
            {language === 'ru'
              ? 'Один прямоугольник. Пять слоёв продукта.'
              : 'One frame. Five product layers.'}
          </h2>
        </div>
        <div className={styles.stackFrame}>
          {stackCards.map((card, index) => {
            const local =
              index === 0
                ? 1
                : smooth(
                    (progress - (index - 1) / (stackCards.length - 1)) *
                      (stackCards.length - 1),
                  );
            const covered = clamp(
              progress * (stackCards.length - 1) - index,
              0,
              1,
            );
            return (
              <article
                key={card.code}
                className={styles.stackCard}
                style={
                  {
                    '--card-y': `${(1 - local) * 104}%`,
                    '--card-scale': 1 - covered * 0.045,
                    '--card-dim': 1 - covered * 0.48,
                    zIndex: index + 1,
                  } as CSSProperties
                }
              >
                <img
                  src={`${baseUrl}portfolio/assets/${card.asset}`}
                  alt=""
                  loading="lazy"
                />
                <div className={styles.stackShade} />
                <span>0{index + 1} / {card.code}</span>
                <h3>{card.code}</h3>
                <p>{language === 'ru' ? card.ru : card.en}</p>
              </article>
            );
          })}
        </div>
        <div className={styles.stackProgress}>
          <i style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </section>
  );
}

const collageTiles = [
  {
    asset: 'caloriept-ai-live.webp',
    x: -29,
    y: -18,
    dx: -42,
    dy: -20,
    rotate: -4,
  },
  {
    asset: 'stylist-ai-showcase.webp',
    x: 4,
    y: -25,
    dx: 16,
    dy: -38,
    rotate: 3,
  },
  {
    asset: 'psy-mind-ai-card.webp',
    x: 27,
    y: -5,
    dx: 46,
    dy: -8,
    rotate: 7,
  },
  {
    asset: 'businessmen-ai-card.webp',
    x: -18,
    y: 9,
    dx: -38,
    dy: 30,
    rotate: 2,
  },
  {
    asset: 'pulse-ai-coach-card.webp',
    x: 12,
    y: 17,
    dx: 22,
    dy: 39,
    rotate: -5,
  },
  {
    asset: 'brandbook-founder-site.webp',
    x: 31,
    y: 21,
    dx: 52,
    dy: 32,
    rotate: 4,
  },
  {
    asset: 'experience-hospitality.webp',
    x: -2,
    y: -1,
    dx: -3,
    dy: -46,
    rotate: -2,
  },
] as const;

export function CollageScatterScene({ language, baseUrl }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const explode = smooth((progress - 0.12) / 0.78) * 0.68;

  return (
    <section
      ref={sectionRef}
      className={styles.collageSection}
      data-testid="collage-scatter-scene"
    >
      <div className={styles.stickyViewport}>
        <div className={styles.collageWord}>
          <span>04 / REAL SYSTEMS</span>
          <h2>DIMKOFF</h2>
          <p>
            {language === 'ru'
              ? 'Разные интерфейсы. Одна продуктовая логика.'
              : 'Different interfaces. One product logic.'}
          </p>
        </div>
        <div className={styles.collageField}>
          {collageTiles.map((tile, index) => (
            <figure
              key={tile.asset}
              style={
                {
                  '--tile-x': `${tile.x + tile.dx * explode}vw`,
                  '--tile-y': `${tile.y + tile.dy * explode}vh`,
                  '--tile-r': `${tile.rotate + tile.rotate * explode * 2.4}deg`,
                  '--tile-z': `${index * 22 + explode * index * 38}px`,
                  '--tile-opacity': 1 - explode * 0.16,
                } as CSSProperties
              }
            >
              <img
                src={`${baseUrl}portfolio/assets/${tile.asset}`}
                alt=""
                loading="lazy"
              />
            </figure>
          ))}
        </div>
        <div className={styles.collageHint}>
          {language === 'ru'
            ? 'Вниз — развернуть систему / вверх — собрать'
            : 'Scroll down to unfold / up to assemble'}
        </div>
      </div>
    </section>
  );
}

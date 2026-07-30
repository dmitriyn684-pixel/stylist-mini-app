import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import styles from './DimkoffPortalHero.module.css';

type HeroProps = {
  language: 'ru' | 'en';
};

function useHeroProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = ref.current;
      if (!section) return;
      const bounds = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      setProgress(THREE.MathUtils.clamp(-bounds.top / distance, 0, 1));
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

function useHeroActive(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '20% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return active;
}

function makeLetterDGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.42, -2.06);
  shape.lineTo(-0.43, -2.06);
  shape.bezierCurveTo(1.38, -2.06, 2.28, -1.12, 2.28, 0);
  shape.bezierCurveTo(2.28, 1.12, 1.38, 2.06, -0.43, 2.06);
  shape.lineTo(-1.42, 2.06);
  shape.closePath();

  const opening = new THREE.Path();
  opening.moveTo(-0.38, -1.18);
  opening.lineTo(-0.38, 1.18);
  opening.bezierCurveTo(0.66, 1.18, 1.18, 0.7, 1.18, 0);
  opening.bezierCurveTo(1.18, -0.7, 0.66, -1.18, -0.38, -1.18);
  opening.closePath();
  shape.holes.push(opening);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.72,
    bevelEnabled: true,
    bevelSize: 0.1,
    bevelThickness: 0.14,
    bevelSegments: 5,
    curveSegments: 36,
    steps: 1,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function PortalLetterD({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const geometry = useMemo(makeLetterDGeometry, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!group.current || !inner.current) return;
    const time = state.clock.elapsedTime;
    group.current.rotation.y =
      Math.sin(time * 0.22) * 0.2 + progress * 0.18 + state.pointer.x * 0.06;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.07 + Math.sin(time * 0.31) * 0.035,
      0.04,
    );
    inner.current.rotation.x = time * 0.17;
    inner.current.rotation.y = -time * 0.23;
  });

  return (
    <group ref={group} scale={[0.76, 0.76, 0.76]} position={[1.18, -0.08, 0]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#262d38"
          metalness={0.82}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.12}
          iridescence={0.34}
          iridescenceIOR={1.7}
          emissive="#0b1426"
          emissiveIntensity={0.18}
          envMapIntensity={1.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group ref={inner} position={[0.34, 0, 0.08]}>
        <mesh position={[0.16, 0.2, 0.2]} scale={0.62}>
          <icosahedronGeometry args={[0.78, 2]} />
          <meshPhysicalMaterial
            color="#cfe4ff"
            transparent
            opacity={0.68}
            metalness={0.12}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.05}
            iridescence={0.84}
            iridescenceIOR={1.7}
            transmission={0.42}
            thickness={0.62}
            envMapIntensity={1.7}
          />
        </mesh>
        <mesh position={[0.25, -0.72, -0.06]} rotation={[0.4, 0.2, 0.5]}>
          <torusKnotGeometry args={[0.42, 0.11, 96, 16]} />
          <meshPhysicalMaterial
            color="#e4bd62"
            metalness={0.56}
            roughness={0.16}
            emissive="#4b3210"
            emissiveIntensity={0.24}
          />
        </mesh>
        <mesh position={[0.2, 0.84, -0.18]} rotation={[0.3, 0.7, 0.1]} scale={0.42}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial
            color="#91c2ff"
            transparent
            opacity={0.62}
            metalness={0.16}
            roughness={0.08}
            clearcoat={1}
          />
        </mesh>
      </group>
      <mesh rotation={[Math.PI / 2.38, 0.24, 0]}>
        <torusGeometry args={[2.62, 0.018, 8, 160]} />
        <meshBasicMaterial color="#9fc7ff" transparent opacity={0.42} />
      </mesh>
      <mesh rotation={[Math.PI / 2.04, -0.28, Math.PI / 2]}>
        <torusGeometry args={[2.24, 0.012, 8, 160]} />
        <meshBasicMaterial color="#e9c66d" transparent opacity={0.34} />
      </mesh>
      {[
        [-2.7, 1.7, -0.6, 0.3],
        [2.9, 1.35, -0.9, 0.22],
        [2.55, -1.7, 0.25, 0.34],
        [-2.35, -1.5, -0.2, 0.2],
      ].map(([x, y, z, scale], index) => (
        <mesh
          key={`${x}-${y}`}
          position={[x, y, z]}
          rotation={[index * 0.42, index * 0.65, index * 0.28]}
          scale={scale}
        >
          <tetrahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color={index % 2 ? '#b9b1ff' : '#bfe9ff'}
            transparent
            opacity={0.46}
            roughness={0.08}
            clearcoat={1}
            transmission={0.42}
            thickness={0.45}
          />
        </mesh>
      ))}
    </group>
  );
}

function PortalCanvas({ progress, active }: { progress: number; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6.8], fov: 42 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 7]} intensity={4.8} color="#effffb" />
      <pointLight position={[-4, -2, 4]} intensity={13} color="#8fb7ff" />
      <pointLight position={[4, 1, 3]} intensity={4.2} color="#e4bd68" />
      <Environment resolution={128}>
        <Lightformer
          intensity={4.5}
          color="#ffffff"
          position={[0, 5, 3]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 2, 1]}
        />
        <Lightformer
          intensity={3}
          color="#9fc7ff"
          position={[-4, 0, 4]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5, 5, 1]}
        />
        <Lightformer
          intensity={1.35}
          color="#f0c76f"
          position={[4, -1, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[4, 3, 1]}
        />
      </Environment>
      <PortalLetterD progress={progress} />
    </Canvas>
  );
}

export function DimkoffPortalHero({ language }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useHeroProgress(sectionRef);
  const active = useHeroActive(sectionRef);
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <section
      id="top"
      ref={sectionRef}
      className={styles.hero}
      data-testid="portal-intro-scene"
      style={{ '--hero-progress': progress } as CSSProperties}
    >
      <div className={styles.viewport}>
        <div className={styles.canvas}><PortalCanvas progress={progress} active={active} /></div>
        <div className={styles.depth} aria-hidden="true" />
        <div className={styles.copy}>
          <p>DIMKOFF — AI PRODUCT STUDIO</p>
          <div className={styles.formula}>SMM. AI. PRODUCT.</div>
          <h1>
            {language === 'ru'
              ? <>AI-продукты<br />и digital-сцены<br />для роста бизнеса</>
              : <>AI products<br />and digital scenes<br />for business growth</>}
          </h1>
          <span>
            {language === 'ru'
              ? 'Соединяю SMM, AI и разработку, чтобы запускать Telegram Mini Apps, AI-ботов, сайты и продуктовые системы.'
              : 'I connect SMM, AI and development to launch Telegram Mini Apps, AI bots, websites and product systems.'}
          </span>
        </div>
        <div className={styles.actions}>
          <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
            {language === 'ru' ? 'Обсудить проект' : 'Discuss a project'} ↗
          </a>
          <a href="#projects">{language === 'ru' ? 'Смотреть проекты' : 'View projects'} ↓</a>
          <a href={`${baseUrl}portfolio/dimkoff-brandbook-2026-visual-v2.pdf`}>
            {language === 'ru' ? 'Брендбук' : 'Brandbook'} ↗
          </a>
        </div>
        <div className={styles.readout}>
          <span>DIGITAL PORTAL / ONLINE</span>
          <strong>{String(Math.round(progress * 100)).padStart(3, '0')}</strong>
        </div>
      </div>
    </section>
  );
}

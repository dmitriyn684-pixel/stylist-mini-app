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
  const geometry = useMemo(makeLetterDGeometry, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 28), [geometry]);

  useEffect(() => () => {
    geometry.dispose();
    edges.dispose();
  }, [edges, geometry]);

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.rotation.y =
      -0.1 + Math.sin(time * 0.17) * 0.075 + progress * 0.08 + state.pointer.x * 0.035;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.035 + Math.sin(time * 0.24) * 0.018,
      0.04,
    );
  });

  return (
    <group ref={group} scale={[0.78, 0.78, 0.78]} position={[1.18, -0.08, 0]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#35404f"
          metalness={0.86}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.06}
          iridescence={0.18}
          iridescenceIOR={1.7}
          emissive="#0b1a31"
          emissiveIntensity={0.2}
          envMapIntensity={2.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edges} position={[0, 0, 0.38]}>
        <lineBasicMaterial color="#a9d6ff" transparent opacity={0.32} />
      </lineSegments>
      <mesh geometry={geometry} scale={[0.87, 0.87, 0.76]} position={[0, 0, 0.48]}>
        <meshPhysicalMaterial
          color="#9fc7ff"
          transparent
          opacity={0.16}
          metalness={0.12}
          roughness={0.04}
          clearcoat={1}
          transmission={0.68}
          thickness={0.65}
          envMapIntensity={2}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.22, 0.1, 0]}>
        <torusGeometry args={[2.72, 0.012, 8, 180]} />
        <meshBasicMaterial color="#9fc7ff" transparent opacity={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2.04, -0.18, Math.PI / 2]}>
        <torusGeometry args={[2.34, 0.008, 8, 180]} />
        <meshBasicMaterial color="#dfbd6c" transparent opacity={0.2} />
      </mesh>
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
      <pointLight position={[-4, -2, 4]} intensity={16} color="#8fb7ff" />
      <pointLight position={[4, 1, 3]} intensity={5.4} color="#e4bd68" />
      <pointLight position={[1, 4, 4]} intensity={7} color="#dbe8ff" />
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
              ? <>AI-продукты,<br />Telegram Mini Apps<br />и digital-сцены</>
              : <>AI products,<br />Telegram Mini Apps<br />and digital scenes</>}
          </h1>
          <span>
            {language === 'ru'
              ? 'DimkoFF соединяет SMM, AI и разработку, чтобы превращать внимание в работающие продукты: ботов, Mini Apps, сайты, воронки, AI-ассистентов и системы запуска.'
              : 'DimkoFF connects SMM, AI and development to turn attention into working products: bots, Mini Apps, websites, funnels, AI assistants and launch systems.'}
          </span>
        </div>
        <div className={styles.actions}>
          <a href="https://t.me/AIStudioDimkoFF" target="_blank" rel="noreferrer">
            {language === 'ru' ? 'Обсудить проект' : 'Discuss a project'} ↗
          </a>
          <a href="#projects">{language === 'ru' ? 'Смотреть проекты' : 'View projects'} ↓</a>
          <a href={`${baseUrl}services/`}>
            {language === 'ru' ? 'Открыть услуги' : 'Explore services'} ↗
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

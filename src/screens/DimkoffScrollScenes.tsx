import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import {
  Environment,
  Lightformer,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import styles from './DimkoffScrollScenes.module.css';

type Language = 'ru' | 'en';

type SceneProps = {
  language: Language;
  baseUrl: string;
};

type ShardSeed = {
  position: THREE.Vector3;
  scatter: THREE.Vector3;
  rotation: THREE.Euler;
  rotationVelocity: THREE.Vector3;
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

function makeCrystalSeeds(count: number, seed = 684): ShardSeed[] {
  const random = seededRandom(seed);
  const result: ShardSeed[] = [];

  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const radius = 0.35 + Math.cbrt(random()) * 1.55;
    const position = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * radius * 1.05,
      Math.cos(phi) * radius * 1.12,
      Math.sin(phi) * Math.sin(theta) * radius * 0.78,
    );
    const direction = position
      .clone()
      .normalize()
      .multiplyScalar(2.2 + random() * 3.2);
    direction.x += (random() - 0.5) * 1.8;
    direction.y += (random() - 0.5) * 1.5;
    direction.z =
      random() < 0.52
        ? 2.3 + random() * 3.4
        : -2 + random() * 3.2;

    result.push({
      position,
      scatter: direction,
      rotation: new THREE.Euler(
        random() * Math.PI,
        random() * Math.PI,
        random() * Math.PI,
      ),
      rotationVelocity: new THREE.Vector3(
        (random() - 0.5) * 1.8,
        (random() - 0.5) * 2.2,
        (random() - 0.5) * 1.6,
      ),
      scale: 0.22 + random() * 0.58,
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
      Math.sin(time * 0.22) * 0.24 + progress * 0.38;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.1 + Math.sin(time * 0.31) * 0.05,
      0.045,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      -state.pointer.x * 0.07 + Math.sin(time * 0.2) * 0.025,
      0.04,
    );
    inner.current.rotation.x = time * 0.21;
    inner.current.rotation.y = -time * 0.29;
    inner.current.rotation.z = Math.sin(time * 0.5) * 0.24;
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
            emissiveIntensity={0.32}
          />
        </mesh>
        <mesh
          position={[0.2, 0.84, -0.18]}
          rotation={[0.3, 0.7, 0.1]}
          scale={0.42}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial
            color="#91c2ff"
            transparent
            opacity={0.62}
            metalness={0.16}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.04}
          />
        </mesh>
      </group>
      <mesh rotation={[Math.PI / 2.38, 0.24, 0]}>
        <torusGeometry args={[2.62, 0.018, 8, 160]} />
        <meshBasicMaterial color="#9fc7ff" transparent opacity={0.42} />
      </mesh>
      <mesh rotation={[Math.PI / 2.04, -0.28, Math.PI / 2]}>
        <torusGeometry args={[2.24, 0.012, 8, 160]} />
        <meshBasicMaterial color="#e9c66d" transparent opacity={0.42} />
      </mesh>
      {[
        [-2.7, 1.7, -0.6, 0.3],
        [2.9, 1.35, -0.9, 0.22],
        [2.55, -1.7, 0.25, 0.34],
        [-2.35, -1.5, -0.2, 0.2],
        [3.4, 0.1, -1.2, 0.16],
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
            opacity={0.5}
            roughness={0.08}
            clearcoat={1}
            transmission={0.45}
            thickness={0.45}
          />
        </mesh>
      ))}
    </group>
  );
}

function CrystalShards({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const solid = useRef<THREE.Mesh>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshPhongMaterial>(null);
  const { size } = useThree();
  const count = size.width < 640 ? 46 : 82;
  const seeds = useMemo(() => makeCrystalSeeds(count, 2026), [count]);
  const helper = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!mesh.current) return;
    const ice = new THREE.Color('#dffeff');
    const blue = new THREE.Color('#8bc9ff');
    const mint = new THREE.Color('#8fffe7');
    const rose = new THREE.Color('#ffd4e8');
    const gold = new THREE.Color('#ffe2a0');
    seeds.forEach((_, index) => {
      mesh.current?.setColorAt(
        index,
        index % 13 === 0
          ? gold
          : index % 9 === 0
            ? rose
            : index % 7 === 0
              ? mint
              : index % 4 === 0
                ? blue
                : ice,
      );
    });
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [seeds]);

  useFrame((state) => {
    if (!group.current || !mesh.current || !solid.current) return;
    const time = state.clock.elapsedTime;
    const explosion = smooth((progress - 0.13) / 0.68);
    const reveal = smooth(explosion / 0.24);

    group.current.rotation.y =
      Math.sin(time * 0.15) * 0.16 + progress * 0.08;
    group.current.rotation.x =
      Math.sin(time * 0.19) * 0.055 + state.pointer.y * 0.035;
    solid.current.rotation.y = time * 0.11;
    solid.current.rotation.x = time * 0.075;
    solid.current.scale.setScalar(1 - explosion * 0.18);
    solid.current.visible = explosion < 0.84;

    seeds.forEach((seed, index) => {
      const drift = Math.sin(time * 0.34 + seed.phase) * 0.045;
      helper.position
        .copy(seed.position)
        .multiplyScalar(0.34 + reveal * 0.66)
        .addScaledVector(seed.scatter, explosion);
      helper.position.x += drift;
      helper.position.y += Math.cos(time * 0.29 + seed.phase) * 0.04;
      helper.rotation.set(
        seed.rotation.x +
          time * seed.rotationVelocity.x * 0.12 +
          explosion * seed.rotationVelocity.x * 1.9,
        seed.rotation.y +
          time * seed.rotationVelocity.y * 0.12 +
          explosion * seed.rotationVelocity.y * 1.9,
        seed.rotation.z +
          time * seed.rotationVelocity.z * 0.12 +
          explosion * seed.rotationVelocity.z * 1.9,
      );
      const scale =
        seed.scale *
        (0.08 + reveal * 0.92) *
        (1 + Math.sin(time * 0.42 + seed.phase) * 0.025);
      helper.scale.set(scale * 0.72, scale * 1.34, scale);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (material.current) {
      material.current.opacity = clamp(explosion * 3.2) * 0.64;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={solid}>
        <dodecahedronGeometry args={[1.38, 0]} />
        <meshPhysicalMaterial
          color="#e8fbff"
          transparent
          opacity={0.56}
          metalness={0.1}
          roughness={0.045}
          clearcoat={1}
          clearcoatRoughness={0.02}
          iridescence={0.8}
          iridescenceIOR={1.7}
          flatShading
          side={THREE.DoubleSide}
        />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, seeds.length]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshPhongMaterial
          ref={material}
          vertexColors
          flatShading
          transparent
          opacity={0}
          color="#eaffff"
          emissive="#edfaff"
          emissiveIntensity={0.18}
          shininess={180}
          specular="#ffffff"
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
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
    const explosion = smooth((progress - 0.13) / 0.68);
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
        size={0.035}
        transparent
        opacity={0.28}
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
      <ambientLight intensity={shatter ? 0.85 : 0.7} />
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
      {shatter ? (
        <>
          <CrystalShards progress={progress} />
          <DiamondDust progress={progress} />
        </>
      ) : (
        <PortalLetterD progress={progress} />
      )}
    </Canvas>
  );
}

export function PortalIntroScene({ language }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const active = useSceneActive(sectionRef);

  return (
    <section
      id="top"
      ref={sectionRef}
      className={styles.introSection}
      data-testid="portal-intro-scene"
      style={{ '--scene-progress': progress } as CSSProperties}
    >
      <div className={styles.stickyViewport}>
        <div className={styles.canvasLayer}>
          <PortalCanvas progress={progress} active={active} />
        </div>
        <div className={styles.sceneMesh} aria-hidden="true" />
        <div className={styles.introTitle}>
          <p>00 / DIGITAL PORTAL</p>
          <div className={styles.titleSwitcher}>
            <h1>
              {language === 'ru'
                ? <>AI-продукты<br />и digital-сцены<br />для роста бизнеса</>
                : <>AI products<br />and digital scenes<br />for business growth</>}
            </h1>
          </div>
          <span>
            {language === 'ru'
              ? 'DimkoFF соединяет SMM, AI и разработку, чтобы превращать внимание в Telegram Mini Apps, AI-ботов, сайты и продуктовые системы.'
              : 'DimkoFF connects SMM, AI and development to turn attention into Telegram Mini Apps, AI bots, websites and product systems.'}
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
          <a href="#projects">
            {language === 'ru' ? 'Смотреть проекты' : 'View projects'} ↓
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
  const explosion = smooth((progress - 0.13) / 0.68);
  const assembledOpacity = 1 - smooth((progress - 0.1) / 0.16);
  const messageOpacity = smooth((progress - 0.18) / 0.18);

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
          <p>01 / CRYSTAL SYSTEM</p>
          <div className={styles.shatterTitleSwitcher}>
            <h2 style={{ opacity: assembledOpacity }}>DIMKOFF</h2>
            <h3 style={{ opacity: messageOpacity }}>
              {language === 'ru'
                ? 'ИЗ ИДЕИ — В РАБОТАЮЩУЮ DIGITAL-СИСТЕМУ'
                : 'FROM AN IDEA TO A WORKING DIGITAL SYSTEM'}
            </h3>
          </div>
          <span style={{ opacity: messageOpacity }}>
            {language === 'ru'
              ? 'AI-продукт, Telegram, интерфейс и запуск соединяются в одну систему роста.'
              : 'AI product, Telegram, interface and launch connect into one growth system.'}
          </span>
        </div>
        <div className={styles.shatterCounter}>
          <span>FACETS / DEPTH</span>
          <strong>{Math.round(1500 * explosion).toLocaleString('ru-RU')}</strong>
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

const foldRows = [
  ['01', 'CaloriePT AI', 'AI NUTRITION / LIVE'],
  ['02', 'Stylist AI', 'FASHION MINI APP / LIVE'],
  ['03', 'AI Bot Portfolio', 'TELEGRAM PRODUCTS'],
  ['04', 'Visual Brandbook', 'VISUAL SYSTEM / 2026'],
  ['05', 'AI Director', 'CONCEPT / IN DEVELOPMENT'],
] as const;

export function FoldScreenScene({ language }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const fold = smooth((progress - 0.08) / 0.74);

  return (
    <section
      ref={sectionRef}
      className={styles.foldSection}
      data-testid="fold-screen-scene"
      style={
        {
          '--fold-progress': fold,
          '--fold-inset': `${(1 - fold) * 50}%`,
        } as CSSProperties
      }
    >
      <div className={styles.stickyViewport}>
        <div className={styles.foldLightLayer}>
          <p>03 / CASE LAB</p>
          <h2>{language === 'ru' ? 'Проекты становятся системой' : 'Projects become a system'}</h2>
          <div className={styles.foldRows}>
            {foldRows.map(([number, name, status]) => (
              <div key={name}>
                <span>{number}</span>
                <strong>{name}</strong>
                <small>{status}</small>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.foldDarkLayer}>
          <p>DIMKOFF / PRODUCTS IN MOTION</p>
          <h2>{language === 'ru' ? 'Интерфейс начинается внутри Telegram' : 'The interface starts inside Telegram'}</h2>
        </div>
        <div className={styles.foldShutters} aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((band) => (
            <i
              key={band}
              style={
                {
                  '--band-index': band,
                  '--band-fold': fold,
                  '--band-rotate': `${(1 - fold) * (68 - band * 5)}deg`,
                  '--band-scale': 0.04 + fold * 0.96,
                  '--band-opacity': 0.12 + fold * 0.88,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className={styles.foldReadout}>
          <span>FOLD / {String(Math.round(fold * 100)).padStart(3, '0')}</span>
        </div>
      </div>
    </section>
  );
}

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
      <i className={styles.phoneSideRail} />
      <i className={styles.phoneVolumeTop} />
      <i className={styles.phoneVolumeBottom} />
      <div className={styles.phoneChassis}>
        <div className={styles.phoneSpeaker}><i /></div>
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
        <i className={styles.phoneGlass} />
        <i className={styles.phoneReflection} />
      </div>
      <i className={styles.phoneFloorShadow} />
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

function ServiceObject({ index }: { index: number }) {
  return (
    <div className={`${styles.serviceObject} ${styles[`serviceObject${index + 1}`]}`} aria-hidden="true">
      <i className={styles.objectOrb} />
      <i className={styles.objectRing} />
      <i className={styles.objectRingSecondary} />
      <i className={styles.objectGlassStrip} />
      <i className={styles.objectCore} />
    </div>
  );
}

export function CardStackScene({ language }: SceneProps) {
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
                <div className={styles.stackShade} />
                <span>0{index + 1} / {card.code}</span>
                <h3>{card.code}</h3>
                <p>{language === 'ru' ? card.ru : card.en}</p>
                <ServiceObject index={index} />
                <div className={styles.stackGlassStrip}>
                  <span>{language === 'ru' ? 'ПРОДУКТОВЫЙ СЛОЙ' : 'PRODUCT LAYER'}</span>
                  <strong>0{index + 1}</strong>
                </div>
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

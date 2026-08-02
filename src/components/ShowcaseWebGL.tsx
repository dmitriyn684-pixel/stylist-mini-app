import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ShowcaseEffectVariant } from './ShowcaseEffects';

type SceneProps = { progress: number };

const clamp = (value: number) => Math.min(1, Math.max(0, value));
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

function useStageProgress(ref: RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      setProgress(clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '25% 0px' });
    observer.observe(element);
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [ref]);

  return { progress, active };
}

function StudioLights({ warm = false }: { warm?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[3, 5, 7]} intensity={4.4} color="#ffffff" />
      <pointLight position={[-4, -1, 4]} intensity={15} color={warm ? '#e7bd65' : '#67e8cf'} />
      <pointLight position={[4, 1, 3]} intensity={10} color={warm ? '#7fded1' : '#d8b76a'} />
      <Environment resolution={128}>
        <Lightformer intensity={4.5} color="#ffffff" position={[0, 5, 3]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 2, 1]} />
        <Lightformer intensity={3} color="#74f2dc" position={[-4, 0, 4]} rotation={[0, Math.PI / 2, 0]} scale={[5, 5, 1]} />
        <Lightformer intensity={2.2} color="#efc972" position={[4, -1, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[4, 3, 1]} />
      </Environment>
    </>
  );
}

type CrystalSeed = {
  assembled: THREE.Vector3;
  scattered: THREE.Vector3;
  rotation: THREE.Euler;
  spin: THREE.Vector3;
  scale: number;
  phase: number;
};

function makeCrystalSeeds(count: number): CrystalSeed[] {
  const random = seededRandom(20260802);
  return Array.from({ length: count }, () => {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const radius = 0.45 + Math.cbrt(random()) * 1.25;
    const assembled = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * radius * 1.35,
      Math.cos(phi) * radius,
      Math.sin(phi) * Math.sin(theta) * radius * 0.75,
    );
    const scattered = assembled.clone().normalize().multiplyScalar(3.2 + random() * 3.8);
    scattered.add(new THREE.Vector3((random() - .5) * 2.4, (random() - .5) * 2, (random() - .5) * 3));
    return {
      assembled,
      scattered,
      rotation: new THREE.Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI),
      spin: new THREE.Vector3((random() - .5) * 2, (random() - .5) * 2, (random() - .5) * 2),
      scale: .16 + random() * .38,
      phase: random() * Math.PI * 2,
    };
  });
}

function CrystalPortfolio({ progress }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const seeds = useMemo(() => makeCrystalSeeds(size.width < 640 ? 54 : 96), [size.width]);
  const helper = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const palette = ['#edffff', '#8ddfd5', '#9fc7ff', '#f0ce79', '#d9c7ff'].map((color) => new THREE.Color(color));
    seeds.forEach((_, index) => mesh.current?.setColorAt(index, palette[index % palette.length]));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [seeds]);

  useFrame((state) => {
    if (!mesh.current || !group.current || !core.current) return;
    const time = state.clock.elapsedTime;
    const explode = smooth((progress - .2) / .68);
    group.current.rotation.y = time * .08 + state.pointer.x * .18;
    group.current.rotation.x = Math.sin(time * .17) * .08 + state.pointer.y * .08;
    core.current.rotation.x = time * .13;
    core.current.rotation.y = -time * .17;
    core.current.scale.setScalar(1 - explode * .5);
    seeds.forEach((seed, index) => {
      helper.position.copy(seed.assembled).lerp(seed.scattered, explode);
      helper.position.y += Math.sin(time * .45 + seed.phase) * .06;
      helper.rotation.set(seed.rotation.x + time * seed.spin.x * .15 + explode * seed.spin.x, seed.rotation.y + time * seed.spin.y * .15 + explode * seed.spin.y, seed.rotation.z + time * seed.spin.z * .15 + explode * seed.spin.z);
      const scale = seed.scale * (1 + Math.sin(time * .6 + seed.phase) * .045);
      helper.scale.set(scale * .75, scale * 1.45, scale);
      helper.updateMatrix();
      mesh.current?.setMatrixAt(index, helper.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} rotation={[.08, -.24, .04]}>
      <mesh ref={core}>
        <dodecahedronGeometry args={[1.44, 1]} />
        <meshPhysicalMaterial color="#dffcff" transparent opacity={.46} metalness={.12} roughness={.04} clearcoat={1} clearcoatRoughness={.02} iridescence={.9} iridescenceIOR={1.8} transmission={.2} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, seeds.length]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial vertexColors flatShading color="#ffffff" emissive="#123f39" emissiveIntensity={.18} metalness={.14} roughness={.11} clearcoat={1} clearcoatRoughness={.02} iridescence={.75} side={THREE.DoubleSide} />
      </instancedMesh>
      <mesh rotation={[Math.PI / 2.2, .2, 0]}><torusGeometry args={[2.25, .012, 8, 180]} /><meshBasicMaterial color="#76f6df" transparent opacity={.4} /></mesh>
      <mesh rotation={[Math.PI / 2, -.2, Math.PI / 2]}><torusGeometry args={[1.92, .009, 8, 180]} /><meshBasicMaterial color="#edc96f" transparent opacity={.32} /></mesh>
    </group>
  );
}

const serviceColors = ['#76f6df', '#9fc7ff', '#d8b76a', '#d5c4ff'];

function ServiceLayers({ progress }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const panels = useRef<Array<THREE.Group | null>>([]);
  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.rotation.y = -.38 + state.pointer.x * .12;
    group.current.rotation.x = .12 + state.pointer.y * .06;
    panels.current.forEach((panel, index) => {
      if (!panel) return;
      const spread = smooth(progress) * .42;
      panel.position.y = (index - 1.5) * (.72 + spread) + Math.sin(time * .55 + index) * .055;
      panel.position.x = (index - 1.5) * spread * .28;
      panel.position.z = index * .38 + Math.sin(time * .4 + index) * .06;
      panel.rotation.z = (index - 1.5) * .025 + Math.sin(time * .3 + index) * .012;
    });
    group.current.position.y = Math.sin(time * .3) * .08;
  });
  return (
    <group ref={group} scale={.88}>
      {serviceColors.map((color, index) => (
        <group key={color} ref={(node) => { panels.current[index] = node; }}>
          <RoundedBox args={[4.7, 1.18, .16]} radius={.13} smoothness={5}>
            <meshPhysicalMaterial color="#111922" metalness={.32} roughness={.13} clearcoat={1} clearcoatRoughness={.05} transparent opacity={.92} />
          </RoundedBox>
          <mesh position={[-1.72, 0, .105]}><circleGeometry args={[.13, 32]} /><meshBasicMaterial color={color} /></mesh>
          <mesh position={[-.75, .13, .105]}><boxGeometry args={[1.55, .085, .02]} /><meshBasicMaterial color={color} transparent opacity={.8} /></mesh>
          <mesh position={[-.95, -.13, .105]}><boxGeometry args={[1.15, .045, .02]} /><meshBasicMaterial color="#ffffff" transparent opacity={.24} /></mesh>
          {[0, 1, 2].map((cell) => <RoundedBox key={cell} args={[.52, .52, .08]} radius={.08} smoothness={4} position={[.55 + cell * .62, 0, .12]}><meshPhysicalMaterial color={color} transparent opacity={.2 + cell * .07} roughness={.12} clearcoat={1} /></RoundedBox>)}
        </group>
      ))}
    </group>
  );
}

function PhoneModel({ x, side = false, accent = '#76f6df', progress = 0 }: { x: number; side?: boolean; accent?: string; progress?: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    if (!side) {
      group.current.rotation.y = -1.08 + smooth(progress) * 1.08 + Math.sin(time * .25) * .04;
      group.current.rotation.x = .08 + Math.sin(time * .33) * .03;
      group.current.position.y = -2.8 + smooth(progress * 1.6) * 2.75 + Math.sin(time * .5) * .06;
    } else {
      group.current.rotation.y = x < 0 ? .48 : -.48;
      group.current.position.y = Math.sin(time * .34 + x) * .05;
    }
  });
  return (
    <group ref={group} position={[x, side ? -.1 : -2.8, side ? -.9 : .6]} scale={side ? .92 : 1.08}>
      <RoundedBox args={[1.65, 3.35, .22]} radius={.24} smoothness={7}>
        <meshPhysicalMaterial color="#090c11" metalness={.72} roughness={.16} clearcoat={1} clearcoatRoughness={.04} />
      </RoundedBox>
      <RoundedBox args={[1.49, 3.13, .035]} radius={.19} smoothness={7} position={[0, 0, .13]}>
        <meshPhysicalMaterial color="#101a20" metalness={.18} roughness={.18} clearcoat={1} emissive={accent} emissiveIntensity={.035} />
      </RoundedBox>
      <RoundedBox args={[.52, .08, .025]} radius={.04} position={[0, 1.42, .165]}><meshBasicMaterial color="#020304" /></RoundedBox>
      <mesh position={[-.43, .95, .17]}><circleGeometry args={[.22, 40]} /><meshBasicMaterial color={accent} transparent opacity={.85} /></mesh>
      <mesh position={[.28, 1.03, .17]}><boxGeometry args={[.58, .08, .02]} /><meshBasicMaterial color="#ffffff" transparent opacity={.58} /></mesh>
      <mesh position={[.17, .82, .17]}><boxGeometry args={[.8, .04, .02]} /><meshBasicMaterial color="#ffffff" transparent opacity={.2} /></mesh>
      <RoundedBox args={[1.12, .78, .025]} radius={.12} position={[0, .15, .17]}><meshPhysicalMaterial color={accent} transparent opacity={.18} roughness={.1} /></RoundedBox>
      {[-.72, -1.12].map((y, index) => <RoundedBox key={y} args={[1.12, .22, .025]} radius={.08} position={[0, y, .17]}><meshBasicMaterial color={index ? '#ffffff' : accent} transparent opacity={index ? .14 : .32} /></RoundedBox>)}
      <mesh position={[.58, .3, .19]} rotation={[0, 0, -.35]}><planeGeometry args={[.34, 2.5]} /><meshBasicMaterial color="#ffffff" transparent opacity={.055} blending={THREE.AdditiveBlending} /></mesh>
    </group>
  );
}

function PartnershipPhones({ progress }: SceneProps) {
  const root = useRef<THREE.Group>(null);
  useFrame((state) => { if (root.current) root.current.rotation.x = state.pointer.y * .035; });
  return <group ref={root}><PhoneModel x={-3.15} side accent="#d8b76a" /><PhoneModel x={0} progress={progress} /><PhoneModel x={3.15} side accent="#9fc7ff" /></group>;
}

type TileSeed = { home: THREE.Vector3; scatter: THREE.Vector3; rotation: THREE.Euler; color: string; phase: number };

function makeTileSeeds(): TileSeed[] {
  const random = seededRandom(6842026);
  const colors = ['#76f6df', '#d8b76a', '#9fc7ff', '#d6c8ff', '#ecf8f5', '#73a8ff', '#e6b8c8', '#9be0bf'];
  return Array.from({ length: 8 }, (_, index) => ({
    home: new THREE.Vector3((index % 4 - 1.5) * 1.38, (Math.floor(index / 4) - .5) * 1.32, (index % 2) * .3),
    scatter: new THREE.Vector3((random() - .5) * 8, (random() - .5) * 5.2, (random() - .5) * 4),
    rotation: new THREE.Euler((random() - .5) * .5, (random() - .5) * .8, (random() - .5) * .35),
    color: colors[index], phase: random() * Math.PI * 2,
  }));
}

function ConceptTiles({ progress }: SceneProps) {
  const refs = useRef<Array<THREE.Group | null>>([]);
  const seeds = useMemo(makeTileSeeds, []);
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const scatter = smooth((progress - .14) / .72);
    refs.current.forEach((tile, index) => {
      if (!tile) return;
      const seed = seeds[index];
      tile.position.copy(seed.home).lerp(seed.scatter, scatter);
      tile.position.y += Math.sin(time * .42 + seed.phase) * .07;
      tile.rotation.set(seed.rotation.x + scatter * seed.rotation.x * 1.7, seed.rotation.y + time * .07 + scatter * seed.rotation.y * 1.8, seed.rotation.z + scatter * seed.rotation.z * 2);
    });
  });
  return <group rotation={[.12, -.1, 0]} scale={1.08}>{seeds.map((seed, index) => <group key={seed.color} ref={(node) => { refs.current[index] = node; }} position={seed.home}><RoundedBox args={[1.22, .92, .13]} radius={.12} smoothness={5}><meshPhysicalMaterial color="#10151c" metalness={.3} roughness={.12} clearcoat={1} transparent opacity={.92} /></RoundedBox><RoundedBox args={[.92, .13, .03]} radius={.04} position={[0, .2, .1]}><meshBasicMaterial color={seed.color} transparent opacity={.72} /></RoundedBox><mesh position={[-.33, -.16, .11]}><circleGeometry args={[.1, 24]} /><meshBasicMaterial color={seed.color} /></mesh><mesh position={[.2, -.16, .11]}><boxGeometry args={[.58, .038, .02]} /><meshBasicMaterial color="#ffffff" transparent opacity={.28} /></mesh></group>)}</group>;
}

function Scene({ variant, progress }: { variant: ShowcaseEffectVariant; progress: number }) {
  if (variant === 'editorialList') return <CrystalPortfolio progress={progress} />;
  if (variant === 'darkServiceLayers') return <ServiceLayers progress={progress} />;
  if (variant === 'glassMotion') return <PartnershipPhones progress={progress} />;
  return <ConceptTiles progress={progress} />;
}

export function ShowcaseWebGL({ variant }: { variant: ShowcaseEffectVariant }) {
  const ref = useRef<HTMLDivElement>(null);
  const { progress, active } = useStageProgress(ref);
  const cameraZ = variant === 'glassMotion' ? 7.2 : 6.6;
  return (
    <div ref={ref} className="showcaseEffect__canvas" data-webgl-scene={variant} aria-hidden="true">
      <Canvas
        dpr={[1, 1.45]}
        frameloop={active ? 'always' : 'never'}
        camera={{ position: [0, 0, cameraZ], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <StudioLights warm={variant === 'glassMotion'} />
        <Scene variant={variant} progress={progress} />
      </Canvas>
      <span className="showcaseEffect__webglLabel">WEBGL / THREE.JS / {String(Math.round(progress * 100)).padStart(3, '0')}</span>
    </div>
  );
}

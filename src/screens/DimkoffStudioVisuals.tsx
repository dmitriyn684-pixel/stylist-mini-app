import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
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

function SignalCore() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current || !ring.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.13 + state.pointer.x * 0.12;
    group.current.rotation.x = Math.sin(t * 0.25) * 0.08 + state.pointer.y * 0.06;
    ring.current.rotation.x = t * 0.08;
    ring.current.rotation.z = -t * 0.1;
  });

  return (
    <group ref={group}>
      <Float speed={1.1} rotationIntensity={0.13} floatIntensity={0.22}>
        <mesh>
          <icosahedronGeometry args={[1.28, 2]} />
          <meshPhysicalMaterial
            color="#9fc7ff"
            metalness={0.32}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.04}
            transmission={0.34}
            thickness={0.85}
            iridescence={0.72}
            iridescenceIOR={1.7}
            envMapIntensity={2}
          />
        </mesh>
        <mesh scale={0.72}>
          <dodecahedronGeometry args={[1.15, 0]} />
          <meshPhysicalMaterial
            color="#171d2a"
            metalness={0.8}
            roughness={0.16}
            emissive="#1b2750"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
      <group ref={ring}>
        <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
          <torusGeometry args={[2.15, 0.018, 8, 160]} />
          <meshBasicMaterial color="#b9b1ff" transparent opacity={0.62} />
        </mesh>
        <mesh rotation={[Math.PI / 1.9, -0.4, Math.PI / 2]}>
          <torusGeometry args={[2.55, 0.012, 8, 160]} />
          <meshBasicMaterial color="#e3bd68" transparent opacity={0.48} />
        </mesh>
        {Array.from({ length: 14 }).map((_, index) => {
          const angle = (index / 14) * Math.PI * 2;
          const radius = index % 2 ? 2.15 : 2.55;
          return (
            <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, (index % 3 - 1) * 0.32]}>
              <octahedronGeometry args={[index % 3 === 0 ? 0.1 : 0.055, 0]} />
              <meshBasicMaterial color={index % 2 ? '#bfe9ff' : '#e3bd68'} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export function ConceptSignalField({ language }: { language: Language }) {
  return (
    <section className={styles.signalField} data-testid="concept-signal-field">
      <div className={styles.signalCanvas}>
        <Canvas dpr={[1, 1.45]} camera={{ position: [0, 0, 7], fov: 42 }}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 4, 5]} intensity={4} color="#ffffff" />
          <pointLight position={[-4, -2, 3]} intensity={10} color="#7d9fff" />
          <pointLight position={[3, 2, 2]} intensity={5} color="#d7b361" />
          <Environment resolution={96}>
            <Lightformer intensity={4} color="#ffffff" position={[0, 4, 3]} scale={[7, 1.5, 1]} />
            <Lightformer intensity={2.5} color="#9fc7ff" position={[-4, 0, 2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 4, 1]} />
          </Environment>
          <SignalCore />
        </Canvas>
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

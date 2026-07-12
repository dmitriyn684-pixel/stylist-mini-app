import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ParametricMannequin, type MannequinHighlight } from './ParametricMannequin';
import type { BodyMeasurements } from '../../types/avatar';

interface AvatarViewerProps {
  measurements: BodyMeasurements;
  highlights?: MannequinHighlight[];
}

export function AvatarViewer({ measurements, highlights }: AvatarViewerProps) {
  const heightUnits = measurements.height * 0.01;
  const target: [number, number, number] = [0, heightUnits / 2, 0];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden" style={{ background: 'var(--color-cream-dark)' }}>
      <Canvas camera={{ position: [0, heightUnits * 0.55, heightUnits * 1.6], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={0.8} />
        <directionalLight position={[-1, 1, -1]} intensity={0.4} />
        <ParametricMannequin measurements={measurements} highlights={highlights} />
        <OrbitControls
          target={target}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.2}
          minDistance={heightUnits * 0.8}
          maxDistance={heightUnits * 3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.6}
        />
        <gridHelper args={[heightUnits * 2.5, 20, '#C9BFAE', '#C9BFAE']} />
      </Canvas>
    </div>
  );
}

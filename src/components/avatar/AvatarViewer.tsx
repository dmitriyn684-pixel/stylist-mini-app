import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ParametricMannequin, computeMannequinLayout, type MannequinHighlight } from './ParametricMannequin';
import type { BodyMeasurements } from '../../types/avatar';

interface AvatarViewerProps {
  measurements: BodyMeasurements;
  highlights?: MannequinHighlight[];
}

export function AvatarViewer({ measurements, highlights }: AvatarViewerProps) {
  // Кадрируем камеру по РЕАЛЬНОЙ верхней точке построенной модели (topY —
  // макушка), а не по measurements.height напрямую: сумма сегментов мерок
  // (inseam + waistToHip + shoulderToWaist) не гарантированно равна росту
  // из фото (тот считается отдельной формулой с поправкой) — при расхождении
  // камера кадрировала «на рост», а голова у модели оказывалась выше кадра.
  const { topY } = computeMannequinLayout(measurements);
  const modelHeightUnits = topY; // реальная высота модели от стоп до макушки
  const target: [number, number, number] = [0, modelHeightUnits / 2, 0];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden" style={{ background: 'var(--color-cream-dark)' }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, modelHeightUnits * 0.55, modelHeightUnits * 1.6], fov: 45 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={0.8} />
        <directionalLight position={[-1, 1, -1]} intensity={0.4} />
        <ParametricMannequin measurements={measurements} highlights={highlights} />
        <OrbitControls
          target={target}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.2}
          minDistance={modelHeightUnits * 0.8}
          maxDistance={modelHeightUnits * 3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.6}
        />
        <gridHelper args={[modelHeightUnits * 2.5, 20, '#C9BFAE', '#C9BFAE']} />
      </Canvas>
    </div>
  );
}

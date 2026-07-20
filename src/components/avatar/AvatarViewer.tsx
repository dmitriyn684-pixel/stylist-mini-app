import { Component, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { MannequinModel, MANNEQUIN_FALLBACK_MODEL_URL } from './MannequinModel';
import { ParametricMannequin, type MannequinHighlight } from './ParametricMannequin';
import type { BodyMeasurements } from '../../types/avatar';

interface AvatarViewerProps {
  measurements: BodyMeasurements;
  highlights?: MannequinHighlight[];
  heightClassName?: string;
  className?: string;
}

interface ModelErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ModelErrorBoundaryState {
  failed: boolean;
}

class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  state: ModelErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ModelErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.warn('Mannequin GLB failed to load; using the next fallback.', error, info);
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ProceduralFallback({
  measurements,
  highlights,
}: Pick<AvatarViewerProps, 'measurements' | 'highlights'>) {
  return <ParametricMannequin measurements={measurements} highlights={highlights} />;
}

function FallbackModel({
  measurements,
  highlights,
}: Pick<AvatarViewerProps, 'measurements' | 'highlights'>) {
  const proceduralFallback = (
    <ProceduralFallback measurements={measurements} highlights={highlights} />
  );

  return (
    <ModelErrorBoundary fallback={proceduralFallback}>
      <Suspense fallback={proceduralFallback}>
        <MannequinModel
          url={MANNEQUIN_FALLBACK_MODEL_URL}
          measurements={measurements}
          highlights={highlights}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
}

export function AvatarViewer({
  measurements,
  highlights,
  heightClassName = 'h-[440px]',
  className = '',
}: AvatarViewerProps) {
  const fallback = <FallbackModel measurements={measurements} highlights={highlights} />;

  return (
    <div
      className={`relative w-full ${heightClassName} overflow-hidden ${className}`}
      style={{
        borderRadius: 28,
        border: '1px solid rgba(255, 255, 255, 0.72)',
        background:
          'radial-gradient(circle at 50% 18%, rgba(255, 248, 240, 0.92), transparent 46%), linear-gradient(180deg, #FBF9F6 0%, #F2EDE5 100%)',
        boxShadow:
          '0 4px 24px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0.85, 2.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.45} color="#FFF8F0" />
        <directionalLight position={[1.5, 2.5, 2]} intensity={1.2} color="#FFF8F0" />
        <directionalLight position={[-1.8, 1.2, -1]} intensity={0.45} color="#F0E6FF" />
        <directionalLight position={[0, 2, -2.5]} intensity={0.5} color="#FFF5EE" />

        <ModelErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <MannequinModel measurements={measurements} highlights={highlights} />
          </Suspense>
        </ModelErrorBoundary>

        <OrbitControls
          target={[0, 0.55, 0]}
          enablePan={false}
          minDistance={1.4}
          maxDistance={4.5}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 1.6}
          autoRotate
          autoRotateSpeed={0.45}
        />
      </Canvas>

    </div>
  );
}

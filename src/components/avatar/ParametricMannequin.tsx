import { useMemo } from 'react';
import { Vector2 } from 'three';
import type { BodyMeasurements } from '../../types/avatar';

const IVORY_TEXTILE = '#F1E6DA';
const DARK_WOOD = '#4A3728';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export interface MannequinHighlight {
  zone: 'torso' | 'legs' | 'full';
  color: string;
}

function computeMannequinLayout(measurements: BodyMeasurements) {
  const heightScale = clamp(measurements.height / 165, 0.92, 1.1);
  const shoulderWidth = measurements.shoulderWidth;
  const hipWidth = measurements.hipCircumference / Math.PI;
  const waistWidth = measurements.waistCircumference / Math.PI;
  const silhouetteScale = clamp(
    (shoulderWidth / 38 + hipWidth / 34 + waistWidth / 28) / 3,
    0.94,
    1.08,
  );

  return {
    heightScale,
    silhouetteScale,
    topY: 1.42 * heightScale,
  };
}

interface MannequinProps {
  measurements: BodyMeasurements;
  highlights?: MannequinHighlight[];
}

export function ParametricMannequin({ measurements, highlights = [] }: MannequinProps) {
  const { heightScale, silhouetteScale } = useMemo(
    () => computeMannequinLayout(measurements),
    [measurements],
  );
  const fullHighlight = highlights.find((highlight) => highlight.zone === 'full');
  const torsoHighlight = highlights.find((highlight) => highlight.zone === 'torso');
  const textileColor = fullHighlight?.color ?? torsoHighlight?.color ?? IVORY_TEXTILE;

  const torsoProfile = useMemo(
    () => [
      new Vector2(0.27, 0),
      new Vector2(0.31, 0.08),
      new Vector2(0.33, 0.22),
      new Vector2(0.28, 0.36),
      new Vector2(0.2, 0.53),
      new Vector2(0.23, 0.7),
      new Vector2(0.34, 0.9),
      new Vector2(0.38, 1.04),
      new Vector2(0.17, 1.13),
      new Vector2(0.105, 1.2),
      new Vector2(0.095, 1.28),
    ],
    [],
  );

  const standProfile = useMemo(
    () => [
      new Vector2(0.24, 0),
      new Vector2(0.26, 0.025),
      new Vector2(0.19, 0.06),
      new Vector2(0.055, 0.1),
      new Vector2(0.035, 0.16),
      new Vector2(0.035, 0.54),
      new Vector2(0.06, 0.58),
    ],
    [],
  );

  return (
    <group scale={[silhouetteScale, heightScale, silhouetteScale]}>
      <mesh position={[0, 0.14, 0]}>
        <latheGeometry args={[torsoProfile, 40]} />
        <meshPhysicalMaterial
          color={textileColor}
          roughness={0.72}
          metalness={0.02}
          clearcoat={0.08}
          clearcoatRoughness={0.45}
        />
      </mesh>

      <mesh position={[0, -0.36, 0]}>
        <latheGeometry args={[standProfile, 32]} />
        <meshPhysicalMaterial color={DARK_WOOD} roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  );
}

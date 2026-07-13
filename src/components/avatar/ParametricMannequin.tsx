import { useMemo } from 'react';
import type { BodyMeasurements } from '../../types/avatar';

const CM_TO_UNITS = 0.01; // 1 юнит Three.js = 1 метр
const SKIN = '#e8d5c4';

export interface MannequinHighlight {
  zone: 'torso' | 'legs' | 'full';
  color: string;
}

/**
 * Реальная вертикальная раскладка манекена — от стоп (y=0) до макушки.
 * Сумма inseam + waistToHip + shoulderToWaist (мерки от фото) не обязана
 * совпадать с measurements.height (мерка роста через отдельную формулу
 * с эмпирической поправкой в measurementsUtils.ts) — раньше камера в
 * AvatarViewer считала высоту кадра по measurements.height напрямую, а
 * сама геометрия строилась по этой сумме сегментов. При расхождении голова
 * уезжала выше кадра камеры. Экспортируем расчёт, чтобы оба места (меш и
 * камера) всегда были согласованы по построению, а не «в среднем сходились».
 */
export function computeMannequinLayout(measurements: BodyMeasurements) {
  const height = measurements.height * CM_TO_UNITS;
  const shoulderRadius = (measurements.shoulderWidth / 2) * CM_TO_UNITS;
  const waistRadius = (measurements.waistCircumference / (2 * Math.PI)) * CM_TO_UNITS;
  const hipRadius = (measurements.hipCircumference / (2 * Math.PI)) * CM_TO_UNITS;
  const torsoLength = measurements.shoulderToWaist * CM_TO_UNITS;
  const hipLength = measurements.waistToHip * CM_TO_UNITS;
  const legLength = measurements.inseam * CM_TO_UNITS;
  const armLength = height * 0.44;
  const headRadius = height / 15;

  const hipY = legLength;
  const waistY = hipY + hipLength;
  const shoulderY = waistY + torsoLength;
  const headCenterY = shoulderY + headRadius * 2.3;
  const topY = headCenterY + headRadius; // макушка — реальная верхняя точка модели

  return {
    shoulderRadius,
    waistRadius,
    hipRadius,
    legLength,
    armLength,
    headRadius,
    hipY,
    waistY,
    shoulderY,
    headCenterY,
    topY,
  };
}

interface MannequinProps {
  measurements: BodyMeasurements;
  highlights?: MannequinHighlight[]; // несколько зон сразу (например верх+низ для лука)
}

function LimbMesh({
  position,
  radius,
  taperRadius,
  length,
  color = SKIN,
}: {
  position: [number, number, number];
  radius: number;
  taperRadius: number;
  length: number;
  color?: string;
}) {
  return (
    <mesh position={[position[0], position[1] - length / 2, position[2]]}>
      <cylinderGeometry args={[taperRadius, radius, length, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function ParametricMannequin({ measurements, highlights = [] }: MannequinProps) {
  const full = highlights.find((h) => h.zone === 'full');
  const torsoColor = full?.color ?? highlights.find((h) => h.zone === 'torso')?.color ?? SKIN;
  const legsColor = full?.color ?? highlights.find((h) => h.zone === 'legs')?.color ?? SKIN;
  const hipColor = full?.color ?? SKIN;
  const p = useMemo(() => computeMannequinLayout(measurements), [measurements]);

  return (
    <group>
      {/* Голова */}
      <mesh position={[0, p.shoulderY + p.headRadius * 2.3, 0]}>
        <sphereGeometry args={[p.headRadius, 32, 32]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* Шея */}
      <mesh position={[0, p.shoulderY + p.headRadius * 0.7, 0]}>
        <cylinderGeometry args={[p.headRadius * 0.4, p.headRadius * 0.46, p.headRadius * 1.2, 20]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* Торс: плечи (верх) → талия (низ) */}
      <mesh position={[0, (p.shoulderY + p.waistY) / 2, 0]}>
        <cylinderGeometry args={[p.shoulderRadius, p.waistRadius, p.shoulderY - p.waistY, 32]} />
        <meshStandardMaterial color={torsoColor} />
      </mesh>

      {/* Таз: талия (верх) → бёдра (низ) */}
      <mesh position={[0, (p.waistY + p.hipY) / 2, 0]}>
        <cylinderGeometry args={[p.waistRadius, p.hipRadius, p.waistY - p.hipY, 32]} />
        <meshStandardMaterial color={hipColor} />
      </mesh>

      {/* Ноги */}
      <LimbMesh position={[-p.hipRadius * 0.55, p.hipY, 0]} radius={p.hipRadius * 0.42} taperRadius={p.hipRadius * 0.32} length={p.legLength} color={legsColor} />
      <LimbMesh position={[p.hipRadius * 0.55, p.hipY, 0]} radius={p.hipRadius * 0.42} taperRadius={p.hipRadius * 0.32} length={p.legLength} color={legsColor} />

      {/* Руки */}
      <LimbMesh
        position={[-p.shoulderRadius * 0.95, p.shoulderY - p.shoulderRadius * 0.2, 0]}
        radius={p.shoulderRadius * 0.3}
        taperRadius={p.shoulderRadius * 0.2}
        length={p.armLength}
      />
      <LimbMesh
        position={[p.shoulderRadius * 0.95, p.shoulderY - p.shoulderRadius * 0.2, 0]}
        radius={p.shoulderRadius * 0.3}
        taperRadius={p.shoulderRadius * 0.2}
        length={p.armLength}
      />
    </group>
  );
}

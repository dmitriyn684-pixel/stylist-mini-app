import type { BodyMeasurements, FrontLandmarks, Keypoint3D, SideLandmarks } from '../types/avatar';
import { LANDMARK } from '../services/poseDetector';

export const DEFAULT_HEIGHT_CM = 165;
export const MIN_VISIBILITY = 0.7;
const SIDE_DEPTH_RATIO = 0.75;

export interface LowVisibilityWarning {
  point: string;
  visibility: number;
}

/** MediaPipe отдаёт координаты, нормализованные по ширине/высоте картинки раздельно —
 * переводим в пиксели одного и того же изображения, иначе Euclidean-расстояния
 * между x и y будут в разных масштабах при не-квадратном фото. */
export function toPixelSpace(landmarks: Keypoint3D[], width: number, height: number): Keypoint3D[] {
  return landmarks.map((lm) => ({
    x: lm.x * width,
    y: lm.y * height,
    z: lm.z * width,
    visibility: lm.visibility,
  }));
}

function lerp(a: Keypoint3D, b: Keypoint3D, t: number): Keypoint3D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
    visibility: Math.min(a.visibility, b.visibility),
  };
}

export function distance(a: Keypoint3D, b: Keypoint3D): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
}

/**
 * Строит фронтальные мерки из 33 точек MediaPipe (уже в пиксельных координатах).
 * MediaPipe не даёт точки груди/талии напрямую — интерполируем между плечом и
 * бедром (грудь ~30% пути вниз, талия ~65%). Стандартный приём для DIY-измерений
 * без отдельной модели сегментации тела.
 */
export function buildFrontLandmarks(px: Keypoint3D[]): { landmarks: FrontLandmarks; warnings: LowVisibilityWarning[] } {
  const shoulders = { left: px[LANDMARK.LEFT_SHOULDER], right: px[LANDMARK.RIGHT_SHOULDER] };
  const hips = { left: px[LANDMARK.LEFT_HIP], right: px[LANDMARK.RIGHT_HIP] };
  const knees = { left: px[LANDMARK.LEFT_KNEE], right: px[LANDMARK.RIGHT_KNEE] };
  const ankles = { left: px[LANDMARK.LEFT_ANKLE], right: px[LANDMARK.RIGHT_ANKLE] };
  const nose = px[LANDMARK.NOSE];

  const bust = { left: lerp(shoulders.left, hips.left, 0.3), right: lerp(shoulders.right, hips.right, 0.3) };
  const waist = { left: lerp(shoulders.left, hips.left, 0.65), right: lerp(shoulders.right, hips.right, 0.65) };

  const ankleY = (ankles.left.y + ankles.right.y) / 2;
  // Nose→ankle покрывает ~88% полного роста (не хватает макушки и стопы) — эмпирическая поправка
  const height_px = (ankleY - nose.y) / 0.88;

  const warnings: LowVisibilityWarning[] = [];
  const check = (name: string, p: Keypoint3D) => {
    if (p.visibility < MIN_VISIBILITY) warnings.push({ point: name, visibility: p.visibility });
  };
  check('левое плечо', shoulders.left);
  check('правое плечо', shoulders.right);
  check('левое бедро', hips.left);
  check('правое бедро', hips.right);
  check('левая лодыжка', ankles.left);
  check('правая лодыжка', ankles.right);

  return { landmarks: { shoulders, bust, waist, hips, knees, ankles, height_px }, warnings };
}

/**
 * MediaPipe Pose отмечает центры суставов, а не силуэт тела, поэтому точную глубину
 * (перёд-зад) по сегментам корпуса из одних лишь точек профильного фото извлечь нельзя
 * без отдельной модели сегментации. Используем статистическую аппроксимацию: глубина ≈
 * 0.75 от ширины сегмента. В ТЗ это описано как fallback на случай отсутствия фото
 * профиля — здесь этот же коэффициент используется как основной метод (это честное
 * ограничение текущего пайплайна, не то же самое, что настоящий замер по профилю).
 */
export function buildSideLandmarks(front: FrontLandmarks): SideLandmarks {
  return {
    shoulder_depth: distance(front.shoulders.left, front.shoulders.right) * SIDE_DEPTH_RATIO,
    bust_depth: distance(front.bust.left, front.bust.right) * SIDE_DEPTH_RATIO,
    waist_depth: distance(front.waist.left, front.waist.right) * SIDE_DEPTH_RATIO,
    hip_depth: distance(front.hips.left, front.hips.right) * SIDE_DEPTH_RATIO,
  };
}

/**
 * Эллиптическая аппроксимация обхвата (формула Рамануджана). Принимает ПОЛУоси
 * (半width, 半depth) — если передать полные ширину/глубину без деления на 2,
 * результат окажется завышен ровно в 2 раза (в исходном псевдокоде из ТЗ была
 * именно эта ошибка — здесь она исправлена).
 */
function ellipseCircumference(semiA: number, semiB: number): number {
  const h = (semiA - semiB) ** 2 / (semiA + semiB) ** 2;
  return Math.PI * (semiA + semiB) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

export function calculateMeasurements(
  front: FrontLandmarks,
  side: SideLandmarks,
  userHeight: number = DEFAULT_HEIGHT_CM
): BodyMeasurements {
  const scale = userHeight / front.height_px;
  const round1 = (n: number) => Math.round(n * 10) / 10;

  const shoulderWidth = distance(front.shoulders.left, front.shoulders.right) * scale;

  const bustWidth = distance(front.bust.left, front.bust.right) * scale;
  const bustDepth = side.bust_depth * scale;
  const bustCircumference = ellipseCircumference(bustWidth / 2, bustDepth / 2);

  const waistWidth = distance(front.waist.left, front.waist.right) * scale;
  const waistDepth = side.waist_depth * scale;
  const waistCircumference = ellipseCircumference(waistWidth / 2, waistDepth / 2);

  const hipWidth = distance(front.hips.left, front.hips.right) * scale;
  const hipDepth = side.hip_depth * scale;
  const hipCircumference = ellipseCircumference(hipWidth / 2, hipDepth / 2);

  const inseam = distance(front.hips.left, front.ankles.left) * scale;

  return {
    height: userHeight,
    shoulderWidth: round1(shoulderWidth),
    bustCircumference: round1(bustCircumference),
    waistCircumference: round1(waistCircumference),
    hipCircumference: round1(hipCircumference),
    inseam: round1(inseam),
    shoulderToWaist: round1(distance(front.shoulders.left, front.waist.left) * scale),
    waistToHip: round1(distance(front.waist.left, front.hips.left) * scale),
  };
}

/**
 * "Уточнить рост" без пересъёмки: все мерки пропорциональны единому scale-фактору
 * (userHeight / height_px), поэтому смена роста — это просто равномерное
 * масштабирование уже посчитанных мерок, без необходимости хранить сырые landmarks.
 */
export function rescaleMeasurements(measurements: BodyMeasurements, newHeight: number): BodyMeasurements {
  const k = newHeight / measurements.height;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    height: newHeight,
    shoulderWidth: round1(measurements.shoulderWidth * k),
    bustCircumference: round1(measurements.bustCircumference * k),
    waistCircumference: round1(measurements.waistCircumference * k),
    hipCircumference: round1(measurements.hipCircumference * k),
    inseam: round1(measurements.inseam * k),
    shoulderToWaist: round1(measurements.shoulderToWaist * k),
    waistToHip: round1(measurements.waistToHip * k),
  };
}

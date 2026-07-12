import type { Keypoint3D } from '../types/avatar';

/**
 * @mediapipe/pose несовместим с ESM-бандлерами "из коробки" (собран как UMD,
 * именованные экспорты назначаются динамически через внутренний хелпер — статический
 * анализ Vite/Rolldown их не видит, сборка падает с "Missing export"). Стандартное
 * решение — грузить библиотеку классическим <script> с CDN (см. index.html), как и
 * в официальных примерах MediaPipe; тогда Pose/POSE_CONNECTIONS попадают в window.
 */
interface MediapipeNormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface MediapipeResults {
  poseLandmarks?: MediapipeNormalizedLandmark[];
}

interface MediapipePoseOptions {
  modelComplexity?: 0 | 1 | 2;
  smoothLandmarks?: boolean;
  enableSegmentation?: boolean;
  smoothSegmentation?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

interface MediapipePoseInstance {
  setOptions(options: MediapipePoseOptions): void;
  onResults(cb: (results: MediapipeResults) => void): void;
  send(inputs: { image: HTMLImageElement }): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    Pose: new (config: { locateFile: (file: string) => string }) => MediapipePoseInstance;
  }
}

let poseInstance: MediapipePoseInstance | null = null;

/**
 * Инстанс — синглтон: создание Pose дорогое (грузит модель ~10-20МБ с CDN).
 * ВАЖНО: детектировать позы нужно последовательно (await один за другим), не
 * параллельно — onResults общий на инстанс, конкурентные send() перезапишут
 * друг другу колбэк.
 */
function getPose(): MediapipePoseInstance {
  if (!window.Pose) {
    throw new Error('MediaPipe Pose ещё не загрузился с CDN — попробуй ещё раз через пару секунд.');
  }
  if (!poseInstance) {
    poseInstance = new window.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
    });
    poseInstance.setOptions({
      modelComplexity: 1,
      smoothLandmarks: false,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }
  return poseInstance;
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
    img.src = url;
  });
}

/**
 * Прогоняет одно изображение через MediaPipe Pose.
 * Возвращает null, если тело на фото не найдено.
 */
export function detectPose(image: HTMLImageElement): Promise<Keypoint3D[] | null> {
  const pose = getPose();
  return new Promise((resolve, reject) => {
    pose.onResults((results: MediapipeResults) => {
      if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
        resolve(null);
        return;
      }
      resolve(
        results.poseLandmarks.map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility ?? 0,
        }))
      );
    });
    pose.send({ image }).catch(reject);
  });
}

export async function disposePose() {
  if (poseInstance) {
    await poseInstance.close();
    poseInstance = null;
  }
}

// Индексы MediaPipe Pose (33-точечная модель BlazePose)
export const LANDMARK = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
} as const;

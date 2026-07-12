export interface Keypoint3D {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface FrontLandmarks {
  shoulders: { left: Keypoint3D; right: Keypoint3D };
  bust: { left: Keypoint3D; right: Keypoint3D };
  waist: { left: Keypoint3D; right: Keypoint3D };
  hips: { left: Keypoint3D; right: Keypoint3D };
  knees: { left: Keypoint3D; right: Keypoint3D };
  ankles: { left: Keypoint3D; right: Keypoint3D };
  height_px: number;
}

export interface SideLandmarks {
  shoulder_depth: number;
  bust_depth: number;
  waist_depth: number;
  hip_depth: number;
}

export interface BodyLandmarks {
  front: FrontLandmarks;
  side: SideLandmarks | null;
  fullbody: { height_px: number } | null;
}

export interface BodyMeasurements {
  height: number;
  shoulderWidth: number;
  bustCircumference: number;
  waistCircumference: number;
  hipCircumference: number;
  inseam: number;
  shoulderToWaist: number;
  waistToHip: number;
}

export type PhotoSlot = 'front' | 'side' | 'fullbody';

export interface RawPoseResult {
  landmarks: Keypoint3D[]; // 33 точки MediaPipe Pose, индексация как в POSE_LANDMARKS
}

export type KibbeType =
  | 'Dramatic'
  | 'Soft Dramatic'
  | 'Flamboyant Natural'
  | 'Natural'
  | 'Soft Natural'
  | 'Dramatic Classic'
  | 'Classic'
  | 'Soft Classic'
  | 'Flamboyant Gamine'
  | 'Gamine'
  | 'Soft Gamine'
  | 'Theatrical Romantic'
  | 'Romantic';

export interface KibbeResult {
  type: KibbeType;
  confidence: number;
  yinYangBalance: string;
  description: string;
  recommendations: string[];
}

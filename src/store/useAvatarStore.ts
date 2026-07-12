import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BodyMeasurements, KibbeResult } from '../types/avatar';
import type { LowVisibilityWarning } from '../utils/measurementsUtils';

interface AvatarState {
  userHeight: number;
  measurements: BodyMeasurements | null;
  kibbeResult: KibbeResult | null;
  warnings: LowVisibilityWarning[];
  createdAt: string | null;
  setUserHeight: (height: number) => void;
  setResult: (measurements: BodyMeasurements, kibbe: KibbeResult, warnings: LowVisibilityWarning[]) => void;
  reset: () => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      userHeight: 165,
      measurements: null,
      kibbeResult: null,
      warnings: [],
      createdAt: null,
      setUserHeight: (height) => set({ userHeight: height }),
      setResult: (measurements, kibbeResult, warnings) =>
        set({
          measurements,
          kibbeResult,
          warnings,
          userHeight: measurements.height,
          createdAt: new Date().toISOString(),
        }),
      reset: () => set({ measurements: null, kibbeResult: null, warnings: [], createdAt: null }),
    }),
    { name: 'stylist_avatar' }
  )
);

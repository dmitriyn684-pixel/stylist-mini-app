import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CapsuleState {
  savedLookIds: string[];
  toggleSave: (lookId: string) => void;
}

export const useCapsuleStore = create<CapsuleState>()(
  persist(
    (set, get) => ({
      savedLookIds: [],
      toggleSave: (lookId) => {
        const current = get().savedLookIds;
        set({
          savedLookIds: current.includes(lookId) ? current.filter((id) => id !== lookId) : [...current, lookId],
        });
      },
    }),
    { name: 'stylist_capsule' }
  )
);

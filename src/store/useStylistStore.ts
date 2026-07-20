import { create } from 'zustand';
import { DEFAULT_STYLIST_ID, type AIStylistId } from '../data/aiStylists';

interface StylistState {
  selectedStylistId: AIStylistId;
  setSelectedStylist: (id: AIStylistId) => void;
}

export const useStylistStore = create<StylistState>((set) => ({
  selectedStylistId: DEFAULT_STYLIST_ID,
  setSelectedStylist: (selectedStylistId) => set({ selectedStylistId }),
}));

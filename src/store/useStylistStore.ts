import { create } from 'zustand';

export type StylistId = 'default' | 'stylist1' | 'stylist2' | 'stylist3';

export interface StylistPersona {
  id: StylistId;
  name: string;
  tag: string;
  monogram: string;
  avatar: string;
  description: string;
  chips: string[];
  promptPlaceholder: string;
  systemPromptPlaceholder: string;
}

export const DEFAULT_STYLIST_ID: StylistId = 'default';

export const STYLISTS: StylistPersona[] = [
  {
    id: 'stylist1',
    name: 'Stylist 1',
    tag: 'Luxury',
    monogram: '01',
    avatar: 'linear-gradient(145deg, #b8763b, #643e2d)',
    description: 'Описание стилиста будет добавлено позже.',
    chips: ['Luxury', 'Evening', 'Editorial'],
    promptPlaceholder: '',
    systemPromptPlaceholder: '',
  },
  {
    id: 'stylist2',
    name: 'Stylist 2',
    tag: 'Minimal',
    monogram: '02',
    avatar: 'linear-gradient(145deg, #6f8582, #304f51)',
    description: 'Описание стилиста будет добавлено позже.',
    chips: ['Capsule', 'Minimal', 'Daily'],
    promptPlaceholder: '',
    systemPromptPlaceholder: '',
  },
  {
    id: 'stylist3',
    name: 'Stylist 3',
    tag: 'Color / Body',
    monogram: '03',
    avatar: 'linear-gradient(145deg, #d0aa74, #755642)',
    description: 'Описание стилиста будет добавлено позже.',
    chips: ['Color', 'Shape', 'Proportions'],
    promptPlaceholder: '',
    systemPromptPlaceholder: '',
  },
];

export const DEFAULT_STYLIST: StylistPersona = {
  id: DEFAULT_STYLIST_ID,
  name: 'DimkoFF AI',
  tag: 'AI stylist',
  monogram: 'AI',
  avatar: 'linear-gradient(145deg, #6f8582, #304f51)',
  description: '',
  chips: [],
  promptPlaceholder: '',
  systemPromptPlaceholder: '',
};

export function getStylistById(id: StylistId) {
  return id === DEFAULT_STYLIST_ID ? DEFAULT_STYLIST : STYLISTS.find((stylist) => stylist.id === id) ?? DEFAULT_STYLIST;
}

interface StylistState {
  selectedStylistId: StylistId;
  setSelectedStylist: (id: StylistId) => void;
}

export const useStylistStore = create<StylistState>((set) => ({
  selectedStylistId: DEFAULT_STYLIST_ID,
  setSelectedStylist: (selectedStylistId) => set({ selectedStylistId }),
}));

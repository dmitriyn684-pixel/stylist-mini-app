import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Outfit, WardrobeItem } from '../types/wardrobe';

interface WardrobeState {
  items: WardrobeItem[];
  outfits: Outfit[];
  addItem: (item: Omit<WardrobeItem, 'id' | 'createdAt' | 'timesWorn' | 'lastWornAt'>) => WardrobeItem;
  updateItem: (id: string, patch: Partial<WardrobeItem>) => void;
  deleteItem: (id: string) => void;
  markWorn: (id: string) => void;
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => Outfit;
  deleteOutfit: (id: string) => void;
}

const genId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      items: [],
      outfits: [],

      addItem: (item) => {
        const newItem: WardrobeItem = {
          ...item,
          id: genId(),
          timesWorn: 0,
          lastWornAt: null,
          createdAt: new Date().toISOString(),
        };
        set({ items: [newItem, ...get().items] });
        return newItem;
      },

      updateItem: (id, patch) => {
        set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
      },

      deleteItem: (id) => {
        set({
          items: get().items.filter((i) => i.id !== id),
          outfits: get().outfits.map((o) => ({ ...o, itemIds: o.itemIds.filter((iid) => iid !== id) })),
        });
      },

      markWorn: (id) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, timesWorn: i.timesWorn + 1, lastWornAt: new Date().toISOString() } : i
          ),
        });
      },

      addOutfit: (outfit) => {
        const newOutfit: Outfit = { ...outfit, id: genId(), createdAt: new Date().toISOString() };
        set({ outfits: [newOutfit, ...get().outfits] });
        return newOutfit;
      },

      deleteOutfit: (id) => {
        set({ outfits: get().outfits.filter((o) => o.id !== id) });
      },
    }),
    { name: 'stylist_wardrobe' }
  )
);

import type { MannequinHighlight } from '../components/avatar/ParametricMannequin';
import type { WardrobeCategory } from '../types/wardrobe';

export const zoneByCategory: Partial<Record<WardrobeCategory, MannequinHighlight['zone']>> = {
  Верх: 'torso',
  Низ: 'legs',
  Платья: 'full',
};

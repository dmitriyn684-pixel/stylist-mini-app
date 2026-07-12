import type { WardrobeCategory } from './wardrobe';

export type CapsuleStyle = 'work' | 'casual' | 'evening';
export type BudgetTier = 'econom' | 'optimal' | 'premium';

export interface CapsuleItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  color: string;
  price: number;
  styles: CapsuleStyle[];
}

export interface CapsuleLook {
  id: string;
  name: string;
  style: CapsuleStyle;
  itemIds: string[];
}

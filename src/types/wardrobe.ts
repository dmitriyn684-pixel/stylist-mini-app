export type ClothingType = 'top' | 'bottom' | 'dress' | 'outerwear';
export type BodyPart = 'torso' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg';

export interface UvBounds {
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
}

export interface MappingZone {
  bodyPart: BodyPart;
  uvBounds: UvBounds;
  scaleFactors: {
    width: number;
    height: number;
  };
}

export interface ClothingSkin {
  id: string;
  type: ClothingType;
  textureUrl: string;
  mappingZones: MappingZone[];
  fabricProperties?: {
    stretch: number;
    thickness: number;
    drape: number;
  };
}

export type WardrobeCategory = 'Верх' | 'Низ' | 'Платья' | 'Обувь' | 'Аксессуары';
export type Season = 'Весна' | 'Лето' | 'Осень' | 'Зима';

export interface WardrobeItem {
  id: string;
  imageUrl: string; // сжатый data URL, хранится локально (localStorage)
  category: WardrobeCategory;
  categoryConfidence: number | null; // null = категория введена вручную, не AI
  color: string; // HEX
  season: Season[];
  fabric: string;
  brand?: string;
  timesWorn: number;
  lastWornAt: string | null;
  createdAt: string;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  mood?: string;
  occasion?: string;
  createdAt: string;
}

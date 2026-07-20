import type { ColorSwatch } from './analysis';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  error?: boolean;
  // 'palette' — детерминированная карточка с реальными HEX из анализа
  // пользователя (см. ChatScreen「Показать мою палитру」), не ответ LLM.
  // Так пользователь всегда может увидеть настоящие цвета, а не то, что
  // модель нарисовала одинаковыми квадратиками в свободном тексте.
  // 'note' — локальная (не от AI) подсказка интерфейса, например честное
  // "фото пока не анализирую в чате" при клике на 📷 — не уходит на сервер.
  kind?: 'text' | 'palette' | 'note';
  palette?: {
    base: ColorSwatch[];
    accent: ColorSwatch[];
    avoid: ColorSwatch[];
  };
}

export interface ChatProfileMeasurements {
  height: number;
  shoulderWidth: number;
  bustCircumference: number;
  waistCircumference: number;
  hipCircumference: number;
  inseam: number;
}

export interface ChatProfileWardrobeItem {
  name?: string;
  category: string;
  color: string;
  hex?: string;
  seasons?: string[];
  material?: string;
}

export interface ChatProfileCatalogItem {
  name: string;
  category: string;
  color: string;
  price?: number;
  styles?: string[];
}

export interface ChatProfile {
  seasonalType?: string | null;
  kibbeType?: string | null;
  measurements?: ChatProfileMeasurements | null;
  wardrobe?: ChatProfileWardrobeItem[];
  catalog?: ChatProfileCatalogItem[];
  palette?: { base: ColorSwatch[]; accent: ColorSwatch[]; avoid: ColorSwatch[] } | null;
}

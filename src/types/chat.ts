export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  error?: boolean;
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
  category: string;
  color: string;
}

export interface ChatProfile {
  seasonalType?: string | null;
  kibbeType?: string | null;
  measurements?: ChatProfileMeasurements | null;
  wardrobe?: ChatProfileWardrobeItem[];
}

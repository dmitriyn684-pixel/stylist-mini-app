export type Warmth = 'cold' | 'warm' | 'unknown';
export type Contrast = 'high' | 'medium' | 'low';
export type ClothingPref = 'warm' | 'cold' | 'unsure';

export interface ColorQuizAnswers {
  skinTone: Warmth;
  contrast: Contrast;
  hairColor: string;
  eyeColor: string;
  clothingPref: ClothingPref;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface ColorAnalysisResult {
  seasonalType: string;
  koreanSubtype: string;
  kibbeType: string;
  description: string;
  palette: {
    base: ColorSwatch[];
    accent: ColorSwatch[];
    avoid: ColorSwatch[];
  };
}

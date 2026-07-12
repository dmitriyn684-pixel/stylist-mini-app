import '@tensorflow/tfjs';
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import type { WardrobeCategory } from '../types/wardrobe';

let modelPromise: Promise<mobilenetModule.MobileNet> | null = null;

function getModel() {
  if (!modelPromise) {
    modelPromise = mobilenetModule.load({ version: 2, alpha: 1.0 });
  }
  return modelPromise;
}

/**
 * MobileNet обучен на ImageNet (1000 общих классов быта/животных/предметов),
 * а не на fashion-категориях — поэтому это ПРЕДПОЛОЖЕНИЕ по ключевым словам в
 * названии распознанного класса, а не точный классификатор одежды. Пользователь
 * всегда может поправить категорию вручную (и должен — точность tut ограничена).
 */
const CATEGORY_KEYWORDS: [RegExp, WardrobeCategory][] = [
  [/\b(gown|academic gown|robe|kimono)\b/, 'Платья'],
  [/\b(jersey|t-shirt|tee shirt|sweatshirt|cardigan|poncho|vest|brassiere|bikini|maillot|jacket|coat|blazer|sarong)\b/, 'Верх'],
  [/\b(jean|trouser|miniskirt|skirt|trunks|shorts)\b/, 'Низ'],
  [/\b(sandal|clog|loafer|running shoe|sneaker|boot|shoe)\b/, 'Обувь'],
  [/\b(tie|bow tie|scarf|bag|purse|backpack|handbag|sunglass|hat|cap|glove|belt|umbrella|holster)\b/, 'Аксессуары'],
];

export interface CategoryGuess {
  category: WardrobeCategory | null;
  confidence: number | null;
  rawLabel: string;
}

export async function guessCategory(canvas: HTMLCanvasElement): Promise<CategoryGuess> {
  const model = await getModel();
  const predictions = await model.classify(canvas, 5);
  for (const p of predictions) {
    const label = p.className.toLowerCase();
    for (const [pattern, category] of CATEGORY_KEYWORDS) {
      if (pattern.test(label)) {
        return { category, confidence: Math.round(p.probability * 100), rawLabel: p.className };
      }
    }
  }
  return { category: null, confidence: null, rawLabel: predictions[0]?.className ?? '' };
}

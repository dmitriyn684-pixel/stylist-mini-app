import type { ColorAnalysisResult, ColorQuizAnswers } from '../types/analysis';

/**
 * ВАЖНО: это упрощённый детерминированный алгоритм-заглушка (тепло × контраст),
 * а не реальный AI-анализ. В Sprint 2 по ТЗ здесь должен быть вызов GPT-4o/DeepSeek
 * через бэкенд — бэкенда пока нет, поэтому результат считается на клиенте.
 * Тип фигуры по Кибби здесь — тоже грубая эвристика по контрастности, а не полноценная
 * 13-архетипная методика (для неё нужны мерки/фото — будет в Sprint 3 вместе с 3D-аватаром).
 */

const SEASONS: Record<string, ColorAnalysisResult> = {
  cold_high: {
    seasonalType: 'Холодная Зима',
    koreanSubtype: 'Deep Winter Cool',
    kibbeType: 'Dramatic',
    description:
      'Высокий контраст и холодный подтон. Тебе идут чистые, ледяные и глубокие цвета — чёрный, белый, изумрудный, малиновый.',
    palette: {
      base: [
        { name: 'Чёрный', hex: '#0A0A0A' },
        { name: 'Белый', hex: '#FFFFFF' },
        { name: 'Угольно-серый', hex: '#2B2B33' },
        { name: 'Тёмно-синий', hex: '#0B2545' },
        { name: 'Бордовый', hex: '#6B0F1A' },
      ],
      accent: [
        { name: 'Изумрудный', hex: '#00693E' },
        { name: 'Малиновый', hex: '#C6003D' },
        { name: 'Сапфировый', hex: '#0F52BA' },
        { name: 'Фуксия', hex: '#C2007A' },
      ],
      avoid: [
        { name: 'Пастельный персиковый', hex: '#FFD9B3' },
        { name: 'Горчичный', hex: '#C9A227' },
        { name: 'Тёплый бежевый', hex: '#E8D3B0' },
        { name: 'Кремовый', hex: '#F5E9D6' },
      ],
    },
  },
  cold_medium: {
    seasonalType: 'Холодное Лето',
    koreanSubtype: 'Cool Summer Muted',
    kibbeType: 'Classic',
    description:
      'Средний контраст, холодный подтон, приглушённые оттенки. Мягкая, элегантная палитра без резких контрастов.',
    palette: {
      base: [
        { name: 'Голубино-серый', hex: '#9AA6B2' },
        { name: 'Пыльно-розовый', hex: '#D8A7B1' },
        { name: 'Серо-синий', hex: '#5B7C99' },
        { name: 'Молочно-белый', hex: '#F2F1EC' },
        { name: 'Графитовый', hex: '#454955' },
      ],
      accent: [
        { name: 'Лавандовый', hex: '#9B8AA8' },
        { name: 'Голубой шёлк', hex: '#6FA8C7' },
        { name: 'Розовое вино', hex: '#A24B62' },
        { name: 'Сизый', hex: '#7F91A6' },
      ],
      avoid: [
        { name: 'Оранжевый', hex: '#E8622D' },
        { name: 'Горчичный', hex: '#C9A227' },
        { name: 'Тёплый коричневый', hex: '#7A4B2A' },
        { name: 'Ярко-жёлтый', hex: '#F4D000' },
      ],
    },
  },
  cold_low: {
    seasonalType: 'Мягкое Лето',
    koreanSubtype: 'Soft Summer Muted Cool',
    kibbeType: 'Romantic',
    description:
      'Низкий контраст, холодный подтон, приглушённые пыльные оттенки — никаких ярких вспышек, только благородная дымка.',
    palette: {
      base: [
        { name: 'Тауп', hex: '#9C8F84' },
        { name: 'Дымчато-серый', hex: '#B7B4AC' },
        { name: 'Пыльно-лавандовый', hex: '#B7A7C4' },
        { name: 'Молочный', hex: '#EDE7DD' },
        { name: 'Серо-голубой', hex: '#8FA0AC' },
      ],
      accent: [
        { name: 'Приглушённая слива', hex: '#7C5468' },
        { name: 'Пыльно-розовый', hex: '#C99AA3' },
        { name: 'Шалфей', hex: '#8FA592' },
        { name: 'Сизо-синий', hex: '#6E85A0' },
      ],
      avoid: [
        { name: 'Чёрный', hex: '#0A0A0A' },
        { name: 'Ярко-оранжевый', hex: '#FF6A13' },
        { name: 'Неоново-жёлтый', hex: '#F4FF3D' },
        { name: 'Томатно-красный', hex: '#E23D28' },
      ],
    },
  },
  warm_high: {
    seasonalType: 'Яркая Весна',
    koreanSubtype: 'True Spring Warm',
    kibbeType: 'Dramatic',
    description: 'Высокий контраст, тёплый подтон. Сочные, чистые, солнечные цвета — твоя стихия.',
    palette: {
      base: [
        { name: 'Слоновая кость', hex: '#FFF8E7' },
        { name: 'Тёплый бежевый', hex: '#E8D3B0' },
        { name: 'Верблюжий', hex: '#C9A876' },
        { name: 'Тёплый коричневый', hex: '#8A5A32' },
        { name: 'Golden-хаки', hex: '#A68A3C' },
      ],
      accent: [
        { name: 'Коралловый', hex: '#FF6F59' },
        { name: 'Бирюзовый', hex: '#00B2A9' },
        { name: 'Золотой', hex: '#E0A937' },
        { name: 'Изумрудно-зелёный', hex: '#2FA84F' },
      ],
      avoid: [
        { name: 'Чёрный', hex: '#0A0A0A' },
        { name: 'Холодный серый', hex: '#8A8D93' },
        { name: 'Пыльно-лавандовый', hex: '#B7A7C4' },
        { name: 'Ледяной голубой', hex: '#C9E4F2' },
      ],
    },
  },
  warm_medium: {
    seasonalType: 'Тёплая Осень',
    koreanSubtype: 'True Autumn Warm',
    kibbeType: 'Natural',
    description:
      'Средний контраст, тёплый подтон, насыщенные землистые цвета — как осенний лес в золотой час.',
    palette: {
      base: [
        { name: 'Тёмный шоколад', hex: '#4A2E1F' },
        { name: 'Верблюжий', hex: '#C9A876' },
        { name: 'Оливковый', hex: '#6B6F3A' },
        { name: 'Терракотовый', hex: '#B5502F' },
        { name: 'Кремовый', hex: '#F0E1C0' },
      ],
      accent: [
        { name: 'Ржавый', hex: '#A0491D' },
        { name: 'Горчичный', hex: '#C9A227' },
        { name: 'Тыквенный', hex: '#D9731A' },
        { name: 'Хвойно-зелёный', hex: '#3E5C3A' },
      ],
      avoid: [
        { name: 'Холодный розовый', hex: '#F4B8C4' },
        { name: 'Ледяной голубой', hex: '#C9E4F2' },
        { name: 'Чистый белый', hex: '#FFFFFF' },
        { name: 'Фуксия', hex: '#C2007A' },
      ],
    },
  },
  warm_low: {
    seasonalType: 'Мягкая Осень',
    koreanSubtype: 'Soft Autumn Muted Warm',
    kibbeType: 'Soft Natural',
    description:
      'Низкий контраст, тёплый подтон, приглушённые природные оттенки — уютная, «земляная» гамма без резкости.',
    palette: {
      base: [
        { name: 'Тёплый серо-бежевый', hex: '#C7B9A3' },
        { name: 'Мягкий хаки', hex: '#9C9370' },
        { name: 'Дымчато-оливковый', hex: '#7D8065' },
        { name: 'Молочно-кремовый', hex: '#EEE3D0' },
        { name: 'Тёплый серый', hex: '#A69B8D' },
      ],
      accent: [
        { name: 'Приглушённый терракот', hex: '#B27655' },
        { name: 'Шалфейно-зелёный', hex: '#869279' },
        { name: 'Горчично-золотой', hex: '#C2A050' },
        { name: 'Кирпичный', hex: '#A3543C' },
      ],
      avoid: [
        { name: 'Чёрный', hex: '#0A0A0A' },
        { name: 'Ярко-розовый', hex: '#E8449A' },
        { name: 'Ледяной синий', hex: '#A9D2E6' },
        { name: 'Чистый белый', hex: '#FFFFFF' },
      ],
    },
  },
};

function resolveWarmth(answers: ColorQuizAnswers): 'cold' | 'warm' {
  if (answers.skinTone !== 'unknown') return answers.skinTone;
  if (answers.clothingPref === 'warm') return 'warm';
  return 'cold';
}

export function determineColorType(answers: ColorQuizAnswers): ColorAnalysisResult {
  const warmth = resolveWarmth(answers);
  const key = `${warmth}_${answers.contrast}`;
  return SEASONS[key] ?? SEASONS.cold_medium;
}

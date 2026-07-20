export type AIStylistId = 'rachel_zoe' | 'christine_scaman' | 'ellie_jean_royden';

export interface AIStylistUiData {
  id: AIStylistId;
  number: string;
  name: string;
  fullName: string;
  tag: string;
  shortPreview: string;
  preview: string;
  value: string;
  manner: string;
  role: string;
  chips: string[];
}

export const aiStylists: AIStylistUiData[] = [
  {
    id: 'rachel_zoe',
    number: '01',
    name: 'Rachel',
    fullName: 'Rachel Zoe',
    tag: 'Luxury Editorial',
    shortPreview: 'Создаст образ, который запомнят. Luxury из твоего гардероба. Аксессуары решают всё.',
    preview:
      'AI-стилист в эстетике Rachel Zoe — для образов, где важно выглядеть дорого, заметно и собранно. Это не просто “что надеть”, а как создать момент: силуэт, аксессуары, наслоение, фактура и эффект первого впечатления.',
    value:
      'Разговор ценен тем, что она мыслит не вещами, а образом целиком. Поможет превратить обычный комплект в luxury-look без бюджета голливудской звезды.',
    manner:
      'Гламурная, драматичная, уверенная. Больше акцентов, больше выразительности, больше fashion-настроения.',
    role: 'Luxury-образы из твоего гардероба, аксессуары, вечерние выходы, статусные комплекты.',
    chips: ['Luxury', 'Accessories', 'Statement'],
  },
  {
    id: 'christine_scaman',
    number: '02',
    name: 'Christine',
    fullName: 'Christine Scaman',
    tag: 'Sci/ART Color',
    shortPreview:
      'Разберёт твой цветотип через Sci/ART: подтон, контраст, hue/value/chroma и точные оттенки с HEX-кодами.',
    preview:
      'AI-стилист в эстетике Christine Scaman — для точного цветотипирования, персональной палитры и понимания, какие оттенки делают лицо свежее, дороже и гармоничнее.',
    value:
      'Разговор ценен тем, что помогает перестать покупать вещи “почти подходящего” цвета. Ты понимаешь не просто “синий”, а какой именно синий работает на твою кожу, контраст и подтон.',
    manner:
      'Спокойная, научная, терпеливая. Объясняет цвет через hue, value и chroma, но простым языком.',
    role:
      'Цветотип Sci/ART, персональная палитра, HEX-коды, металлы, базовые и акцентные цвета, оттенки, которых лучше избегать.',
    chips: ['Sci/ART', 'Palette', 'Undertone'],
  },
  {
    id: 'ellie_jean_royden',
    number: '03',
    name: 'Ellie-Jean',
    fullName: 'Ellie-Jean Royden',
    tag: 'Color & Body',
    shortPreview:
      'Объяснит твой типаж через простые примеры. Ты перестанешь ругать фигуру и начнёшь понимать свои линии.',
    preview:
      'AI-стилист в эстетике Ellie-Jean Royden — для разбора фигуры, линий, пропорций и того, почему одни вещи сидят “вау”, а другие будто взяты не из твоего гардероба. Она переводит сложные системы стиля на понятный человеческий язык.',
    value:
      'Разговор ценен тем, что помогает перестать спорить со своей фигурой. Вместо “мне это нельзя” появляется понимание: какие силуэты, длины, вырезы, ткани и посадка работают именно на тебя.',
    manner:
      'Дружелюбная, живая, как старшая сестра, которая разбирается в моде. Объясняет через примеры, сравнения и простые визуальные правила.',
    role: 'Типаж, линии фигуры, фасоны, DO/DON’T, пропорции и HTT-образы от головы до пят.',
    chips: ['Body type', 'Lines', 'Proportions'],
  },
];

export const DEFAULT_STYLIST_ID: AIStylistId = 'rachel_zoe';

export function getAIStylistById(id: AIStylistId): AIStylistUiData {
  return aiStylists.find((stylist) => stylist.id === id) ?? aiStylists[0];
}

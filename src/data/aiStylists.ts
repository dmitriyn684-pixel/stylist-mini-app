export type AIStylistId = 'rachel_zoe' | 'lina_hansen' | 'ellie_jean_royden';

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
    id: 'lina_hansen',
    number: '02',
    name: 'Lina',
    fullName: 'Lina Hansen',
    tag: 'Color Science',
    shortPreview:
      'Назовёт твой точный цвет. Не “синий”, а холодный сапфировый. Цвета-убийцы больше не попадут в шкаф.',
    preview:
      'AI-стилист в эстетике Lina Hansen — для точного разбора цвета, подтона и персональной палитры. Здесь нет “мне кажется”: только спокойная логика, оттенки, контрастность и цвета, которые действительно работают на внешность.',
    value:
      'Разговор ценен тем, что помогает перестать покупать вещи, которые потом просто лежат в шкафу. Ты понимаешь не только “какой цвет красивый”, а какой цвет делает лицо свежее, дороже и гармоничнее.',
    manner:
      'Точная, спокойная, аналитичная. Объясняет сложное простым языком и помогает видеть разницу между похожими оттенками.',
    role:
      'Цветотип, подтон, палитра с HEX-кодами, базовые цвета, акцентные цвета и оттенки, которых лучше избегать.',
    chips: ['Color', 'Palette', 'Undertone'],
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

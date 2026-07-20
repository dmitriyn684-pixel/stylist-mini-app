import { create } from 'zustand';

export type AIStylistId = 'rachel' | 'lina' | 'ellie';
export type StylistId = 'default' | AIStylistId;

export interface StylistPersona {
  id: StylistId;
  name: string;
  fullName: string;
  tag: string;
  monogram: string;
  avatar: string;
  shortPreview: string;
  preview: string;
  value: string;
  manner: string;
  role: string;
  chips: string[];
  systemPrompt: string;
}

export const DEFAULT_STYLIST_ID: StylistId = 'default';

export const STYLISTS = [
  {
    id: 'rachel',
    name: 'Rachel',
    fullName: 'Rachel Zoe',
    tag: 'Luxury Editorial',
    monogram: '01',
    avatar: 'linear-gradient(145deg, #b8763b, #643e2d)',
    shortPreview: 'Создаст образ, который запомнят. Luxury из твоего гардероба. Аксессуары решают всё.',
    preview:
      'AI-стилист в эстетике Rachel Zoe — для образов, где важно выглядеть дорого, заметно и собранно. Это не просто “что надеть”, а как создать момент: силуэт, аксессуары, наслоение, фактура и эффект первого впечатления.',
    value:
      'Разговор ценен тем, что она мыслит не вещами, а образом целиком. Поможет превратить обычный комплект в luxury-look без бюджета голливудской звезды.',
    manner:
      'Гламурная, драматичная, уверенная. Больше акцентов, больше выразительности, больше fashion-настроения.',
    role: 'Luxury-образы из твоего гардероба, аксессуары, вечерние выходы, статусные комплекты.',
    chips: ['Luxury', 'Accessories', 'Statement'],
    systemPrompt: '',
  },
  {
    id: 'lina',
    name: 'Lina',
    fullName: 'Lina Hansen',
    tag: 'Color Science',
    monogram: '02',
    avatar: 'linear-gradient(145deg, #6f8582, #304f51)',
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
    systemPrompt: '',
  },
  {
    id: 'ellie',
    name: 'Ellie-Jean',
    fullName: 'Ellie-Jean Royden',
    tag: 'Color & Body',
    monogram: '03',
    avatar: 'linear-gradient(145deg, #d0aa74, #755642)',
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
    systemPrompt: '',
  },
] satisfies StylistPersona[];

export const DEFAULT_STYLIST: StylistPersona = {
  id: DEFAULT_STYLIST_ID,
  name: 'DimkoFF AI',
  fullName: 'DimkoFF AI',
  tag: 'AI stylist',
  monogram: 'AI',
  avatar: 'linear-gradient(145deg, #6f8582, #304f51)',
  shortPreview: '',
  preview: '',
  value: '',
  manner: '',
  role: '',
  chips: [],
  systemPrompt: '',
};

export function getStylistById(id: StylistId) {
  return id === DEFAULT_STYLIST_ID ? DEFAULT_STYLIST : STYLISTS.find((stylist) => stylist.id === id) ?? DEFAULT_STYLIST;
}

interface StylistState {
  selectedStylistId: StylistId;
  setSelectedStylist: (id: StylistId) => void;
}

export const useStylistStore = create<StylistState>((set) => ({
  selectedStylistId: DEFAULT_STYLIST_ID,
  setSelectedStylist: (selectedStylistId) => set({ selectedStylistId }),
}));

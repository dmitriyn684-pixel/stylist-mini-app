import { CameraIcon, SuitcaseIcon, PaletteIcon, ChatIcon } from '../components/ui/icons';

export const mockUser = {
  name: 'Аня',
  seasonalType: 'Тёмная Зима',
  kibbeType: 'Soft Dramatic',
};

export const mockWardrobeStats = {
  totalItems: 47,
  totalOutfits: 23,
  readyPercent: 68,
};

export const mockCategoryBars = [
  { label: 'Верх', value: 21, max: 47, color: 'var(--color-lavender)' },
  { label: 'Низ', value: 14, max: 47, color: 'var(--color-blue)' },
  { label: 'Обувь', value: 9, max: 47, color: 'var(--color-pink)' },
];

export const mockDayLook = {
  title: 'Образ дня готов',
  tip: 'Тёмно-синий верх + золотой акцент подчеркнут твой цветотип «Тёмная Зима».',
};

export const mockChallenge = {
  title: 'Надень то, что не носила больше месяца',
};

export const mockQuickActions = [
  { key: 'photo', label: 'Сфоткать вещь', Icon: CameraIcon, to: '/wardrobe/add' },
  { key: 'suitcase', label: 'Собрать чемодан', Icon: SuitcaseIcon, to: '/wardrobe/suitcase' },
  { key: 'palette', label: 'Мой цветотип', Icon: PaletteIcon, to: '/stylist' },
  { key: 'chat', label: 'Спросить стилиста', Icon: ChatIcon, to: '/chat' },
];

import type { CapsuleItem, CapsuleLook } from '../types/capsule';

/**
 * Статическая база ~100 вещей с примерными ценами — не живые данные с
 * маркетплейсов (реального API у WB/Lamoda для этого проекта нет, это
 * партнёрские договоры, а не простой ключ). Цены ориентировочные, для
 * оценки бюджета лука. Кнопки "Купить" ведут на реальный поиск по названию
 * вещи на wildberries.ru / lamoda.ru — см. marketplaceLinks.ts.
 */
export const CAPSULE_ITEMS: CapsuleItem[] = [
  // ─── ВЕРХ ───
  { id: 't01', name: 'Белая рубашка классическая', category: 'Верх', color: '#FFFFFF', price: 2990, styles: ['work', 'casual'] },
  { id: 't02', name: 'Голубая рубашка в полоску', category: 'Верх', color: '#A8C5D8', price: 3290, styles: ['work'] },
  { id: 't03', name: 'Чёрная водолазка', category: 'Верх', color: '#0A0A0A', price: 1990, styles: ['work', 'casual', 'evening'] },
  { id: 't04', name: 'Бежевый свитер оверсайз', category: 'Верх', color: '#D8C8AE', price: 3490, styles: ['casual'] },
  { id: 't05', name: 'Кремовая блуза с бантом', category: 'Верх', color: '#F0E6D2', price: 3990, styles: ['work', 'evening'] },
  { id: 't06', name: 'Серый кардиган', category: 'Верх', color: '#9B9690', price: 3690, styles: ['work', 'casual'] },
  { id: 't07', name: 'Красная шёлковая блуза', category: 'Верх', color: '#C0392B', price: 4990, styles: ['evening'] },
  { id: 't08', name: 'Чёрный жакет приталенный', category: 'Верх', color: '#1A1A1A', price: 6990, styles: ['work', 'evening'] },
  { id: 't09', name: 'Джинсовая куртка', category: 'Верх', color: '#4A6B8A', price: 4290, styles: ['casual'] },
  { id: 't10', name: 'Бежевый тренч', category: 'Верх', color: '#C9B79C', price: 8990, styles: ['work', 'casual'] },
  { id: 't11', name: 'Оливковая рубашка милитари', category: 'Верх', color: '#6B6F3A', price: 2790, styles: ['casual'] },
  { id: 't12', name: 'Розовый свитшот', category: 'Верх', color: '#E8A9B8', price: 2490, styles: ['casual'] },
  { id: 't13', name: 'Белая футболка базовая', category: 'Верх', color: '#FFFFFF', price: 990, styles: ['casual'] },
  { id: 't14', name: 'Чёрная кожаная косуха', category: 'Верх', color: '#0D0D0D', price: 7990, styles: ['casual', 'evening'] },
  { id: 't15', name: 'Изумрудная блуза', category: 'Верх', color: '#1F6650', price: 4490, styles: ['evening'] },
  { id: 't16', name: 'Молочный джемпер тонкой вязки', category: 'Верх', color: '#F2ECE0', price: 3290, styles: ['work', 'casual'] },
  { id: 't17', name: 'Синий пиджак', category: 'Верх', color: '#23395D', price: 6490, styles: ['work'] },
  { id: 't18', name: 'Терракотовая туника', category: 'Верх', color: '#C1502E', price: 2990, styles: ['casual'] },
  { id: 't19', name: 'Чёрный вязаный топ', category: 'Верх', color: '#151515', price: 2290, styles: ['evening'] },
  { id: 't20', name: 'Горчичный кардиган оверсайз', category: 'Верх', color: '#C9A227', price: 3890, styles: ['casual'] },
  { id: 't21', name: 'Белая рубашка оверсайз', category: 'Верх', color: '#FAFAFA', price: 2890, styles: ['work', 'casual'] },
  { id: 't22', name: 'Бордовый свитер', category: 'Верх', color: '#6B0F1A', price: 3390, styles: ['work', 'casual'] },
  { id: 't23', name: 'Серебристая блуза с пайетками', category: 'Верх', color: '#C7C9CC', price: 5490, styles: ['evening'] },
  { id: 't24', name: 'Хаки жилет', category: 'Верх', color: '#7C7A5D', price: 2690, styles: ['casual'] },
  { id: 't25', name: 'Чёрный смокинг-жакет', category: 'Верх', color: '#0A0A0A', price: 8490, styles: ['evening'] },
  { id: 't26', name: 'Базовое поло', category: 'Верх', color: '#23395D', price: 1490, styles: ['work', 'casual'] },

  // ─── НИЗ ───
  { id: 'b01', name: 'Чёрные брюки классические', category: 'Низ', color: '#0D0D0D', price: 3490, styles: ['work', 'evening'] },
  { id: 'b02', name: 'Синие джинсы прямые', category: 'Низ', color: '#2E4A6B', price: 3990, styles: ['casual'] },
  { id: 'b03', name: 'Бежевые брюки палаццо', category: 'Низ', color: '#D8C8AE', price: 3790, styles: ['work', 'casual'] },
  { id: 'b04', name: 'Чёрная юбка-карандаш', category: 'Низ', color: '#101010', price: 2990, styles: ['work', 'evening'] },
  { id: 'b05', name: 'Джинсы-мом', category: 'Низ', color: '#4A6B8A', price: 3690, styles: ['casual'] },
  { id: 'b06', name: 'Серые брюки со стрелками', category: 'Низ', color: '#8A8D93', price: 3590, styles: ['work'] },
  { id: 'b07', name: 'Кожаная юбка мини', category: 'Низ', color: '#1A1A1A', price: 4290, styles: ['evening', 'casual'] },
  { id: 'b08', name: 'Оливковые карго-брюки', category: 'Низ', color: '#6B6F3A', price: 3290, styles: ['casual'] },
  { id: 'b09', name: 'Плиссированная юбка миди', category: 'Низ', color: '#E8DCC8', price: 2890, styles: ['casual', 'work'] },
  { id: 'b10', name: 'Чёрные лосины', category: 'Низ', color: '#0A0A0A', price: 1490, styles: ['casual'] },
  { id: 'b11', name: 'Белые джинсы', category: 'Низ', color: '#F5F5F0', price: 3890, styles: ['casual'] },
  { id: 'b12', name: 'Твидовая юбка', category: 'Низ', color: '#B5A88A', price: 3990, styles: ['work'] },
  { id: 'b13', name: 'Шёлковые брюки-кюлоты', category: 'Низ', color: '#1F1F1F', price: 4690, styles: ['evening', 'work'] },
  { id: 'b14', name: 'Джинсовая юбка', category: 'Низ', color: '#4A6B8A', price: 2690, styles: ['casual'] },
  { id: 'b15', name: 'Бордовые вельветовые брюки', category: 'Низ', color: '#6B0F1A', price: 3390, styles: ['casual'] },
  { id: 'b16', name: 'Чёрные шорты элегантные', category: 'Низ', color: '#0D0D0D', price: 2490, styles: ['evening'] },
  { id: 'b17', name: 'Клетчатая юбка миди', category: 'Низ', color: '#7A4B2A', price: 2990, styles: ['casual', 'work'] },
  { id: 'b18', name: 'Атласная юбка макси', category: 'Низ', color: '#8C1D2C', price: 4490, styles: ['evening'] },
  { id: 'b19', name: 'Бежевые чиносы', category: 'Низ', color: '#C9A876', price: 2990, styles: ['casual', 'work'] },
  { id: 'b20', name: 'Чёрные кожаные брюки', category: 'Низ', color: '#0A0A0A', price: 6990, styles: ['evening', 'casual'] },
  { id: 'b21', name: 'Бюджетные классические брюки', category: 'Низ', color: '#2B2B33', price: 2490, styles: ['work'] },

  // ─── ПЛАТЬЯ ───
  { id: 'd01', name: 'Чёрное платье-футляр', category: 'Платья', color: '#0A0A0A', price: 4990, styles: ['work', 'evening'] },
  { id: 'd02', name: 'Красное вечернее платье', category: 'Платья', color: '#A6192E', price: 7990, styles: ['evening'] },
  { id: 'd03', name: 'Бежевое платье-рубашка', category: 'Платья', color: '#D8C8AE', price: 3990, styles: ['work', 'casual'] },
  { id: 'd04', name: 'Изумрудное платье-миди', category: 'Платья', color: '#1F6650', price: 6490, styles: ['evening'] },
  { id: 'd05', name: 'Джинсовое платье', category: 'Платья', color: '#4A6B8A', price: 3490, styles: ['casual'] },
  { id: 'd06', name: 'Чёрное коктейльное платье', category: 'Платья', color: '#101010', price: 5990, styles: ['evening'] },
  { id: 'd07', name: 'Цветочное платье летнее', category: 'Платья', color: '#E8A9B8', price: 2990, styles: ['casual'] },
  { id: 'd08', name: 'Синее платье-футляр', category: 'Платья', color: '#23395D', price: 4490, styles: ['work'] },
  { id: 'd09', name: 'Атласное платье-комбинация', category: 'Платья', color: '#8C1D2C', price: 5490, styles: ['evening'] },
  { id: 'd10', name: 'Вязаное платье оверсайз', category: 'Платья', color: '#9B9690', price: 3690, styles: ['casual'] },
  { id: 'd11', name: 'Терракотовое платье миди', category: 'Платья', color: '#C1502E', price: 3990, styles: ['casual', 'work'] },
  { id: 'd12', name: 'Чёрное платье с запахом', category: 'Платья', color: '#151515', price: 4690, styles: ['work', 'evening'] },
  { id: 'd13', name: 'Белое платье-рубашка', category: 'Платья', color: '#FAFAFA', price: 3290, styles: ['casual'] },
  { id: 'd14', name: 'Бархатное платье бордовое', category: 'Платья', color: '#6B0F1A', price: 6990, styles: ['evening'] },
  { id: 'd15', name: 'Оливковое платье-сафари', category: 'Платья', color: '#6B6F3A', price: 3590, styles: ['casual'] },
  { id: 'd16', name: 'Простое чёрное платье', category: 'Платья', color: '#0A0A0A', price: 2990, styles: ['evening', 'casual'] },

  // ─── ОБУВЬ ───
  { id: 's01', name: 'Чёрные туфли-лодочки', category: 'Обувь', color: '#0A0A0A', price: 4990, styles: ['work', 'evening'] },
  { id: 's02', name: 'Белые кроссовки', category: 'Обувь', color: '#FAFAFA', price: 5990, styles: ['casual'] },
  { id: 's03', name: 'Бежевые ботильоны', category: 'Обувь', color: '#C9A876', price: 6490, styles: ['work', 'casual'] },
  { id: 's04', name: 'Чёрные лоферы', category: 'Обувь', color: '#101010', price: 5490, styles: ['work', 'casual'] },
  { id: 's05', name: 'Красные туфли на каблуке', category: 'Обувь', color: '#A6192E', price: 5990, styles: ['evening'] },
  { id: 's06', name: 'Коричневые челси', category: 'Обувь', color: '#4A2E1F', price: 6990, styles: ['casual'] },
  { id: 's07', name: 'Серебристые босоножки', category: 'Обувь', color: '#C7C9CC', price: 4490, styles: ['evening'] },
  { id: 's08', name: 'Чёрные сапоги на низком ходу', category: 'Обувь', color: '#0D0D0D', price: 7990, styles: ['casual', 'work'] },
  { id: 's09', name: 'Бежевые эспадрильи', category: 'Обувь', color: '#E8DCC8', price: 2990, styles: ['casual'] },
  { id: 's10', name: 'Золотистые сандалии', category: 'Обувь', color: '#C9A227', price: 3990, styles: ['evening'] },
  { id: 's11', name: 'Белые кеды', category: 'Обувь', color: '#F5F5F0', price: 3490, styles: ['casual'] },
  { id: 's12', name: 'Чёрные ботинки на платформе', category: 'Обувь', color: '#151515', price: 6490, styles: ['casual'] },
  { id: 's13', name: 'Карамельные лоферы', category: 'Обувь', color: '#C49A6C', price: 5790, styles: ['work'] },
  { id: 's14', name: 'Бордовые туфли', category: 'Обувь', color: '#6B0F1A', price: 5490, styles: ['evening'] },
  { id: 's15', name: 'Оливковые кроссовки', category: 'Обувь', color: '#6B6F3A', price: 4990, styles: ['casual'] },
  { id: 's16', name: 'Чёрные высокие сапоги', category: 'Обувь', color: '#0A0A0A', price: 8990, styles: ['casual', 'evening'] },
  { id: 's17', name: 'Бежевые туфли-лодочки', category: 'Обувь', color: '#D8C8AE', price: 4790, styles: ['work'] },
  { id: 's18', name: 'Прозрачные босоножки на каблуке', category: 'Обувь', color: '#E8E4DC', price: 6990, styles: ['evening'] },
  { id: 's19', name: 'Тёмно-синие лоферы', category: 'Обувь', color: '#23395D', price: 5290, styles: ['work'] },
  { id: 's20', name: 'Розовые кеды', category: 'Обувь', color: '#E8A9B8', price: 3290, styles: ['casual'] },
  { id: 's21', name: 'Бюджетные туфли-лодочки', category: 'Обувь', color: '#101010', price: 3490, styles: ['work', 'evening'] },

  // ─── АКСЕССУАРЫ ───
  { id: 'a01', name: 'Золотые серьги-кольца', category: 'Аксессуары', color: '#C9A227', price: 990, styles: ['evening', 'casual'] },
  { id: 'a02', name: 'Кожаный ремень чёрный', category: 'Аксессуары', color: '#0A0A0A', price: 1490, styles: ['work', 'casual'] },
  { id: 'a03', name: 'Шёлковый платок', category: 'Аксессуары', color: '#A6192E', price: 1990, styles: ['work', 'evening'] },
  { id: 'a04', name: 'Чёрная сумка тоут', category: 'Аксессуары', color: '#0D0D0D', price: 4990, styles: ['work', 'casual'] },
  { id: 'a05', name: 'Клатч золотистый', category: 'Аксессуары', color: '#C9A227', price: 3490, styles: ['evening'] },
  { id: 'a06', name: 'Бежевая сумка через плечо', category: 'Аксессуары', color: '#D8C8AE', price: 3990, styles: ['casual', 'work'] },
  { id: 'a07', name: 'Солнцезащитные очки', category: 'Аксессуары', color: '#151515', price: 2490, styles: ['casual'] },
  { id: 'a08', name: 'Жемчужное колье', category: 'Аксессуары', color: '#F0EAD8', price: 2990, styles: ['evening', 'work'] },
  { id: 'a09', name: 'Кожаные перчатки чёрные', category: 'Аксессуары', color: '#0A0A0A', price: 1790, styles: ['casual'] },
  { id: 'a10', name: 'Широкополая шляпа', category: 'Аксессуары', color: '#C9A876', price: 1990, styles: ['casual'] },
  { id: 'a11', name: 'Тонкий кожаный ремень', category: 'Аксессуары', color: '#4A2E1F', price: 1290, styles: ['work'] },
  { id: 'a12', name: 'Массивные серьги', category: 'Аксессуары', color: '#C7C9CC', price: 1490, styles: ['evening'] },
  { id: 'a13', name: 'Шарф кашемировый', category: 'Аксессуары', color: '#9B9690', price: 3490, styles: ['casual', 'work'] },
  { id: 'a14', name: 'Чёрная клатч-сумка', category: 'Аксессуары', color: '#101010', price: 3990, styles: ['evening'] },
  { id: 'a15', name: 'Кожаный рюкзак', category: 'Аксессуары', color: '#6B4A2E', price: 5490, styles: ['casual'] },
  { id: 'a16', name: 'Заколка-краб', category: 'Аксессуары', color: '#0A0A0A', price: 490, styles: ['casual'] },
  { id: 'a17', name: 'Браслет-цепь золотой', category: 'Аксессуары', color: '#C9A227', price: 1290, styles: ['evening', 'casual'] },
  { id: 'a18', name: 'Вязаная шапка', category: 'Аксессуары', color: '#7A6F5D', price: 1490, styles: ['casual'] },
  { id: 'a19', name: 'Кожаный ремень с пряжкой', category: 'Аксессуары', color: '#1A1A1A', price: 1990, styles: ['work', 'evening'] },
  { id: 'a20', name: 'Брошь винтажная', category: 'Аксессуары', color: '#C9A227', price: 990, styles: ['work', 'evening'] },
  { id: 'a21', name: 'Простые серьги-гвоздики', category: 'Аксессуары', color: '#C7C9CC', price: 490, styles: ['evening', 'work', 'casual'] },
];

/**
 * Кураторские луки — вручную подобранные сочетаемые комбинации (а не случайный
 * перебор), чтобы вещи реально сочетались по цвету и стилю.
 */
export const CAPSULE_LOOKS: CapsuleLook[] = [
  // На работу
  { id: 'l-work-1', name: 'Классика в офис', style: 'work', itemIds: ['t01', 'b01', 's01', 'a02'] },
  { id: 'l-work-2', name: 'Строгая элегантность', style: 'work', itemIds: ['t17', 'b06', 's19', 'a11'] },
  { id: 'l-work-3', name: 'Тёплый деловой', style: 'work', itemIds: ['t16', 'b03', 's17', 'a06'] },
  { id: 'l-work-4', name: 'Платье + жакет', style: 'work', itemIds: ['d08', 't08', 's13'] },
  { id: 'l-work-5', name: 'Бюджетный минимализм', style: 'work', itemIds: ['t26', 'b21', 's21'] },

  // На каждый день
  { id: 'l-casual-1', name: 'Джинсовый уикенд', style: 'casual', itemIds: ['t13', 'b02', 's02', 'a07'] },
  { id: 'l-casual-2', name: 'Уютный оверсайз', style: 'casual', itemIds: ['t04', 'b10', 's12', 'a18'] },
  { id: 'l-casual-3', name: 'Городской милитари', style: 'casual', itemIds: ['t11', 'b08', 's06', 'a09'] },
  { id: 'l-casual-4', name: 'Лёгкое летнее платье', style: 'casual', itemIds: ['d07', 's20', 'a16'] },

  // На выход
  { id: 'l-evening-1', name: 'Коктейльный вечер', style: 'evening', itemIds: ['d06', 's05', 'a05'] },
  { id: 'l-evening-2', name: 'Красная дорожка', style: 'evening', itemIds: ['d02', 's07', 'a12'] },
  { id: 'l-evening-3', name: 'Смокинг-шик', style: 'evening', itemIds: ['t25', 'b16', 's18', 'a14'] },
  { id: 'l-evening-4', name: 'Изумрудный вечер', style: 'evening', itemIds: ['d04', 's14', 'a08'] },
  { id: 'l-evening-5', name: 'Простой чёрный вечер', style: 'evening', itemIds: ['d16', 's21', 'a21'] },
];

export function getCapsuleItem(id: string): CapsuleItem | undefined {
  return CAPSULE_ITEMS.find((i) => i.id === id);
}

export function lookItems(look: CapsuleLook): CapsuleItem[] {
  return look.itemIds.map(getCapsuleItem).filter((i): i is CapsuleItem => Boolean(i));
}

export function lookTotalPrice(look: CapsuleLook): number {
  return lookItems(look).reduce((sum, i) => sum + i.price, 0);
}

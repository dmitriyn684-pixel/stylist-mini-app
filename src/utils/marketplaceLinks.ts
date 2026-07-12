/**
 * Реальные поисковые ссылки на маркетплейсы (без API — партнёрского договора
 * с WB/Lamoda у нас нет). Ведут на поиск по названию вещи, а не на конкретный
 * товар — конкретный товар и его цену мы не знаем.
 */
export function wildberriesSearchUrl(query: string): string {
  return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(query)}`;
}

export function lamodaSearchUrl(query: string): string {
  return `https://www.lamoda.ru/catalogsearch/result/?q=${encodeURIComponent(query)}`;
}

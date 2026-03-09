const dictionary = {
  localHeroTitle: 'Локальные развлечения и гид по городу',
  localHeroSubtitle: 'Подберите места рядом с отелем: культура, гастрономия, прогулки и вечерние активности.',
  viewOnMap: 'Посмотреть на карте',
  searchPlaceholder: 'Поиск по названию или тегам',
  allCategories: 'Все категории',
  allPrices: 'Любая цена',
  openNow: 'Открыто сейчас',
  sortPopularity: 'По популярности',
  sortDistance: 'По расстоянию',
  sortRating: 'По рейтингу',
  noResults: 'Ничего не найдено. Попробуйте изменить фильтры.',
  addToFavorites: 'Добавить в избранное',
  removeFromFavorites: 'Удалить из избранного',
  details: 'Подробнее',
  bookNow: 'Заказать/Забронировать',
  loadingMap: 'Загрузка карты...',
} as const

export type TranslationKey = keyof typeof dictionary

export function translate(key: TranslationKey): string {
  return dictionary[key] ?? key
}

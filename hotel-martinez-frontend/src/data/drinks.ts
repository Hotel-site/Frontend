export type DrinkItem = {
  id: number
  name: string
  price: string
}

export type DayDrinks = {
  day: string
  items: DrinkItem[]
}

export const DRINKS: DayDrinks[] = [
  {
    day: 'mon',
    items: [
      { id: 1, name: 'Коктейль "Мартини"', price: '9.00' },
      { id: 2, name: 'Коктейль "Мохито"', price: '8.50' },
      { id: 3, name: 'Коктейль "Пина Колада"', price: '8.00' },
      { id: 4, name: 'Cola / Sprite / Fanta', price: '2.50' },
    ],
  },
  {
    day: 'tue',
    items: [
      { id: 1, name: 'Коктейль "Мартини"', price: '9.00' },
      { id: 2, name: 'Коктейль "Мохито"', price: '8.50' },
      { id: 3, name: 'Коктейль "Пина Колада"', price: '8.00' },
      { id: 4, name: 'Cola / Sprite / Fanta', price: '2.50' },
    ],
  },
  {
    day: 'wed',
    items: [
      { id: 1, name: 'Коктейль "Мартини"', price: '9.00' },
      { id: 2, name: 'Коктейль "Мохито"', price: '8.50' },
      { id: 3, name: 'Коктейль "Пина Колада"', price: '8.00' },
      { id: 4, name: 'Cola / Sprite / Fanta', price: '2.50' },
    ],
  },
  {
    day: 'thu',
    items: [
      { id: 1, name: 'Коктейль "Мартини"', price: '9.00' },
      { id: 2, name: 'Коктейль "Мохито"', price: '8.50' },
      { id: 3, name: 'Коктейль "Пина Колада"', price: '8.00' },
      { id: 4, name: 'Cola / Sprite / Fanta', price: '2.50' },
    ],
  },
  {
    day: 'fri',
    items: [
      { id: 1, name: 'Коктейль "Коралловый закат"', price: '10.00' },
      { id: 2, name: 'Коктейль "Бриз с Лазурного берега"', price: '9.50' },
      { id: 3, name: 'Коктейль "Апероль Шпритц"', price: '8.50' },
      { id: 4, name: 'Лимонад домашний', price: '3.50' },
    ],
  },
  {
    day: 'sat',
    items: [
      { id: 1, name: 'Коктейль "Маргарита"', price: '9.50' },
      { id: 2, name: 'Коктейль "Дайкири"', price: '9.00' },
      { id: 3, name: 'Коктейль "Негрони"', price: '10.00' },
      { id: 4, name: 'Свежий фреш микс', price: '4.50' },
    ],
  },
  {
    day: 'sun',
    items: [
      { id: 1, name: 'Коктейль "Голубая лагуна"', price: '9.50' },
      { id: 2, name: 'Коктейль "Джин тоник"', price: '8.00' },
      { id: 3, name: 'Коктейль "Прозеко Роял"', price: '10.50' },
      { id: 4, name: 'Грейпфрутовый фреш', price: '4.00' },
    ],
  },
]

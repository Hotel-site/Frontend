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
      { id: 1, name: 'Коктейль "Мартини"', price: '9.00€' },
      { id: 2, name: 'Коктейль "Мохито"', price: '8.50€' },
      { id: 3, name: 'Коктейль "Пина Колада"', price: '8.00€' },
      { id: 4, name: 'Cola / Sprite / Fanta', price: '2.50€' },
    ],
  },
  {
    day: 'tue',
    items: [
      { id: 1, name: 'Коктейль "Мартини"', price: '9.00€' },
      { id: 2, name: 'Коктейль "Мохито"', price: '8.50€' },
      { id: 3, name: 'Коктейль "Пина Колада"', price: '8.00€' },
      { id: 4, name: 'Cola / Sprite / Fanta', price: '2.50€' },
    ],
  },
  {
    day: 'wed',
    items: [
      { id: 1, name: 'Коктейль "Мартини"', price: '9.00€' },
      { id: 2, name: 'Коктейль "Мохито"', price: '8.50€' },
      { id: 3, name: 'Коктейль "Пина Колада"', price: '8.00€' },
      { id: 4, name: 'Cola / Sprite / Fanta', price: '2.50€' },
    ],
  },
  {
    day: 'thu',
    items: [
      { id: 1, name: 'Коктейль "Мартини"', price: '9.00€' },
      { id: 2, name: 'Коктейль "Мохито"', price: '8.50€' },
      { id: 3, name: 'Коктейль "Пина Колада"', price: '8.00€' },
      { id: 4, name: 'Cola / Sprite / Fanta', price: '2.50€' },
    ],
  },
]

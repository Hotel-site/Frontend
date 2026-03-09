export type MenuItem = {
  id: number
  name: string
  description?: string
  price: string
}

export type MenuSection = {
  category: string
  items: MenuItem[]
}

export type DayMenu = {
  day: string
  label: string
  sections: MenuSection[]
}

export const DAYS: DayMenu[] = [
  {
    day: 'mon',
    label: 'Понедельник',
    sections: [
      {
        category: 'Завтрак',
        items: [
          { id: 1, name: 'Омлет с травами и сыром', description: 'Тосты, микс-салат', price: '8.50€' },
          { id: 2, name: 'Гранола с йогуртом и фруктами', price: '6.00€' },
          { id: 3, name: 'Свежевыжатый апельсиновый сок', price: '3.50€' },
        ],
      },
      {
        category: 'Обед',
        items: [
          { id: 11, name: 'Крем-суп из тыквы', price: '5.50€' },
          { id: 12, name: 'Ризотто с белыми грибами', price: '14.50€' },
          { id: 13, name: 'Салат Нисуаз', price: '10.00€' },
        ],
      },
      {
        category: 'Ужин',
        items: [
          { id: 21, name: 'Филе дорадо, соус миньонет', description: 'Пюре из сельдерея, сезонные овощи', price: '18.00€' },
          { id: 22, name: 'Стейк из говядины 200г', description: 'Соус перечный', price: '22.00€' },
          { id: 23, name: 'Веган-бургер с жареными баклажанами', price: '12.50€' },
        ],
      },
      {
        category: 'Десерты',
        items: [
          { id: 31, name: 'Тирамису домашний', price: '6.50€' },
          { id: 32, name: 'Торт Вечерний Кишинёв', price: '2.80€' },
        ],
      },
    ],
  },
  {
    day: 'tue',
    label: 'Вторник',
    sections: [
      {
        category: 'Завтрак',
        items: [
          { id: 1, name: 'Панкейки с мёдом и орехами', price: '7.00€' },
          { id: 2, name: 'Яйца Бенедикт', description: 'Голландский соус', price: '9.50€' },
          { id: 3, name: 'Смузи-боул с манго', price: '6.80€' },
        ],
      },
      {
        category: 'Обед',
        items: [
          { id: 11, name: 'Салат Цезарь с креветками', price: '11.50€' },
          { id: 12, name: 'Тайская лапша с курицей', price: '12.00€' },
          { id: 13, name: 'Рататуй с киноа', price: '13.00€' },
        ],
      },
      {
        category: 'Ужин',
        items: [
          { id: 21, name: 'Утиная грудка с вишнёвым соусом', price: '20.00€' },
          { id: 22, name: 'Кебаб из ягнёнка', price: '17.50€' },
          { id: 23, name: 'Паста с морепродуктами', price: '16.00€' },
        ],
      },
      {
        category: 'Десерты',
        items: [
          { id: 31, name: 'Шоколадный фондан', price: '6.90€' },
          { id: 32, name: 'Кофе по-венски', price: '3.20€' },
        ],
      },
    ],
  },
  {
    day: 'wed',
    label: 'Среда',
    sections: [
      {
        category: 'Завтрак',
        items: [
          { id: 1, name: 'Авокадо-тост с помидорами', price: '6.50€' },
          { id: 2, name: 'Йогурт с мёдом и орехами', price: '5.00€' },
          { id: 3, name: 'Французские тосты с ягодами', price: '7.50€' },
        ],
      },
      {
        category: 'Обед',
        items: [
          { id: 11, name: 'Кокосовое карри с рисом', description: 'С овощами и тофу', price: '13.50€' },
          { id: 12, name: 'Поке боул с тунцом', price: '14.00€' },
          { id: 13, name: 'Пицца маргарита', price: '11.00€' },
        ],
      },
      {
        category: 'Ужин',
        items: [
          { id: 21, name: 'Лосось на гриле', price: '19.00€' },
          { id: 22, name: 'Равиоли с рикоттой', price: '13.50€' },
          { id: 23, name: 'Бургер с хашбрауном', price: '11.50€' },
        ],
      },
      {
        category: 'Десерты',
        items: [
          { id: 31, name: 'Панна-котта с ягодами', price: '6.00€' },
          { id: 32, name: 'Мороженое ассорти', price: '4.50€' },
        ],
      },
    ],
  },
  {
    day: 'thu',
    label: 'Четверг',
    sections: [
      {
        category: 'Завтрак',
        items: [
          { id: 1, name: 'Бриошь с джемом', price: '4.50€' },
          { id: 2, name: 'Яичница с трюфельным маслом', price: '10.00€' },
          { id: 3, name: 'Сэндвич с лососем и авокадо', price: '9.00€' },
        ],
      },
      {
        category: 'Обед',
        items: [
          { id: 11, name: 'Салат из киноа и свеклы', price: '9.00€' },
          { id: 12, name: 'Куриный суп с лапшой', price: '6.50€' },
          { id: 13, name: 'Тартар из говядины', price: '16.00€' },
        ],
      },
      {
        category: 'Ужин',
        items: [
          { id: 21, name: 'Печёная треска с томатным соусом', price: '17.50€' },
          { id: 22, name: 'Утиная конфи с чечевицей', price: '21.00€' },
          { id: 23, name: 'Овощной карри с нааном', price: '12.00€' },
        ],
      },
      {
        category: 'Десерты',
        items: [
          { id: 31, name: 'Лимонный тарт с безе', price: '6.00€' },
          { id: 32, name: 'Авторский коктейль', price: '9.00€' },
        ],
      },
    ],
  },
]

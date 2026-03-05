export type HotelCategory =
  | 'Номера'
  | 'SPA & Wellness'
  | 'Рестораны'
  | 'Трансфер'
  | 'События'
  | 'Мерч'

export interface Product {
  id: number
  title: string
  price: number
  image: string
  category: HotelCategory
  unit?: string
}

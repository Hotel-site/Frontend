export type KnownHotelCategory =
  | 'Номера'
  | 'SPA & Wellness'
  | 'Рестораны'
  | 'Трансфер'
  | 'События'
  | 'Мерч'

// Allow categories coming from DB while keeping autocomplete for known values.
export type HotelCategory = KnownHotelCategory | (string & {})

export interface Product {
  id: number
  title: string
  price: number
  image: string
  images?: string[]
  category: HotelCategory
  unit?: string
  description?: string
  requiresBooking?: boolean
}

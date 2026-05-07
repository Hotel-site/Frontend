import type { Product } from './product'
import type { Attraction } from './local'

export interface BookingData {
  dateTime: string
  guestCount?: number
  notes: string
}

export type CartItem = 
  | { type: 'product'; id: number; item: Product }
  | { type: 'attraction'; id: string; item: Attraction }
  | { type: 'booking'; id: string; item: Product; bookingData: BookingData }

export type CartItems = CartItem[]

import type { Product } from './product'
import type { Attraction } from './local'

export type CartItem = 
  | { type: 'product'; id: number; item: Product }
  | { type: 'attraction'; id: string; item: Attraction }

export type CartItems = CartItem[]

export type Category = 'culture' | 'nature' | 'food' | 'shopping' | 'family' | 'nightlife'
export type SortBy = 'popularity' | 'distance' | 'rating'
export type ViewMode = 'grid' | 'list' | 'map'

export interface Coordinates {
  lat: number
  lng: number
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type OpeningHours = Record<Weekday, string>

export interface PartnerContact {
  phone: string
  email: string
  website?: string
  bookingUrl?: string
}

export interface Attraction {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  category: Category
  tags: string[]
  coords: Coordinates
  distanceKm: number
  price: number
  openingHours: OpeningHours
  rating: number
  popularity: number
  images: string[]
  partnerContact: PartnerContact
}

export interface AttractionQueryParams {
  search: string
  category: Category | 'all'
  maxDistanceKm: number
  minPrice: number
  maxPrice: number
  openNow: boolean
  sortBy: SortBy
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface BookingPayload {
  attractionId: string
  guestName: string
  guestPhone: string
}

export interface BookingResponse {
  ok: boolean
  endpoint: string
  message: string
}

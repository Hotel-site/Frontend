import apiClient from './apiClient'

export interface Location {
  address: string
  latitude: number
  longitude: number
}

export interface OpeningHour {
  dayOfWeek: number
  start: string
  end: string
}

export interface PartnerContacts {
  phone: string
  email: string
  bookingUrl: string
}

export interface Attraction {
  id: number
  name: string
  shortDescription: string
  description: string
  categoryId: number
  location: Location
  distance: number
  price: number
  images: Array<{ url: string }>
  openingHours: OpeningHour[]
  contacts: PartnerContacts
  isActive: boolean
}

export const attractionApi = {
  getAll: async (): Promise<Attraction[]> => {
    const response = await apiClient.get<Attraction[]>('/attraction/all')
    return response.data
  },

  getById: async (id: number): Promise<Attraction> => {
    const response = await apiClient.get<Attraction>(`/attraction/${id}`)
    return response.data
  },
}

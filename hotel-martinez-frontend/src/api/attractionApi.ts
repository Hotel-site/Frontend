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

// DTO from backend
export interface AttractionImageDTO {
  url: string
}

export interface AttractionBackendDto {
  id: number
  name: string
  shortDescription?: string
  description?: string
  category?: string
  address: string  // Keep as string, not Location object
  distance: number
  price: number
  rating: number
  popularity: number
  images: AttractionImageDTO[]
  openingHours: OpeningHour[]
  contacts: PartnerContacts
}

// Frontend model
export interface Attraction {
  id: number
  name: string
  shortDescription?: string
  description?: string
  category?: string
  location: Location
  distance: number
  price: number
  rating: number
  popularity: number
  images: string[]
  openingHours: OpeningHour[]
  contacts: PartnerContacts
}

export const attractionApi = {
  getAll: async (): Promise<AttractionBackendDto[]> => {
    try {
      console.log('[attractionApi.getAll] Fetching from /attraction/all...')
      const response = await apiClient.get<AttractionBackendDto[]>('/attraction/all')
      console.log('[attractionApi.getAll] Response status:', response.status)
      console.log('[attractionApi.getAll] Response data:', response.data)
      return response.data || []
    } catch (error) {
      console.error('[attractionApi.getAll] Error:', error)
      return []
    }
  },

  getById: async (id: number): Promise<AttractionBackendDto | null> => {
    try {
      console.log(`[attractionApi.getById] Fetching attraction ${id}...`)
      const response = await apiClient.get<AttractionBackendDto>(`/attraction/${id}`)
      console.log(`[attractionApi.getById] Response for ${id}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`[attractionApi.getById] Error fetching attraction ${id}:`, error)
      return null
    }
  },
}

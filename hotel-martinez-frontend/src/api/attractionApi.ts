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

export interface AttractionImageDTO {
  url: string
}

export interface AttractionBackendDto {
  id: number
  name: string
  shortDescription?: string
  description?: string
  category?: string
  address: string
  distance: number
  price: number
  rating: number
  popularity: number
  images: AttractionImageDTO[]
  openingHours: OpeningHour[]
  contacts: PartnerContacts
}

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

type CreateAttractionPayload = {
  name: string
  shortDescription: string
  description: string
  categoryId?: number | null
  location: {
    address: string
    latitude: number
    longitude: number
  }
  distance: number
  price: number
  images: { url: string }[]
  openingHours: { dayOfWeek: number; start: string; end: string }[]
  contacts: {
    phone: string
    email: string
    bookingUrl: string
  }
}

type UpdateAttractionPayload = {
  id: number
  name: string
  shortDescription?: string | null
  description?: string | null
  categoryId?: number | null
  location: {
    address: string
    latitude: number
    longitude: number
  }
  distance: number
  price: number
  images: { url: string }[]
  openingHours: { dayOfWeek: number; start: string; end: string }[]
  contacts: {
    phone: string
    email: string
    bookingUrl: string
  }
  isActive: boolean
}

const mapWeekdayToNumber = (key: number): number => key

const toOpeningHours = (ohs: OpeningHour[]): { dayOfWeek: number; start: string; end: string }[] => {
  return (ohs ?? []).map((oh) => ({ dayOfWeek: mapWeekdayToNumber(oh.dayOfWeek), start: oh.start, end: oh.end }))
}

const toCreatePayload = (ui: AttractionBackendDto | any): CreateAttractionPayload => {
  const location = {
    address: ui.address ?? ui.location?.address ?? '',
    latitude: ui.location?.latitude ?? ui.location?.lat ?? ui.latitude ?? 0,
    longitude: ui.location?.longitude ?? ui.location?.lng ?? ui.longitude ?? 0,
  }

  return {
    name: ui.name,
    shortDescription: ui.shortDescription ?? '',
    description: ui.description ?? '',
    categoryId: ui.categoryId ?? null,
    location,
    distance: ui.distance ?? 0,
    price: ui.price ?? 0,
    images: (ui.images ?? []).map((x: any) => ({ url: typeof x === 'string' ? x : x?.url })),
    openingHours: toOpeningHours(ui.openingHours ?? []),
    contacts: {
      phone: ui.contacts?.phone ?? '',
      email: ui.contacts?.email ?? '',
      bookingUrl: ui.contacts?.bookingUrl ?? '',
    },
  }
}

const toUpdatePayload = (id: number, ui: AttractionBackendDto | any): UpdateAttractionPayload => {
  const location = {
    address: ui.address ?? ui.location?.address ?? '',
    latitude: ui.location?.latitude ?? ui.location?.lat ?? ui.latitude ?? 0,
    longitude: ui.location?.longitude ?? ui.location?.lng ?? ui.longitude ?? 0,
  }

  return {
    id,
    name: ui.name,
    shortDescription: ui.shortDescription ?? null,
    description: ui.description ?? null,
    categoryId: ui.categoryId ?? null,
    location,
    distance: ui.distance ?? 0,
    price: ui.price ?? 0,
    images: (ui.images ?? []).map((x: any) => ({ url: typeof x === 'string' ? x : x?.url })),
    openingHours: toOpeningHours(ui.openingHours ?? []),
    contacts: {
      phone: ui.contacts?.phone ?? '',
      email: ui.contacts?.email ?? '',
      bookingUrl: ui.contacts?.bookingUrl ?? '',
    },
    isActive: true,
  }
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
      throw error
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

  create: async (payload: any): Promise<void> => {
    await apiClient.post('/attraction', toCreatePayload(payload))
  },

  update: async (id: number, payload: any): Promise<void> => {
    await apiClient.put(`/attraction/${id}`, toUpdatePayload(id, payload))
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/attraction/${id}`)
  },
}


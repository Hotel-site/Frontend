import { getDay } from 'date-fns'
import type {
  Attraction,
  AttractionQueryParams,
  BookingPayload,
  BookingResponse,
  PaginatedResponse,
  Weekday,
} from '../types/local'
import { attractionApi, type AttractionBackendDto } from '../api/attractionApi'

const MOCK_ENDPOINT = '/api/mock-booking'
const NETWORK_DELAY_MS = 350

// Conversion from backend DTO to frontend Attraction type
const convertBackendToFrontend = (dto: AttractionBackendDto): Attraction => {
  // Map DayOfWeek number to Weekday string
  const dayOfWeekMap: Record<number, Weekday> = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    7: 'sunday',
  }

  // Convert backend openingHours array to frontend format
  const openingHours: Record<Weekday, string> = {
    monday: '00:00-23:59',
    tuesday: '00:00-23:59',
    wednesday: '00:00-23:59',
    thursday: '00:00-23:59',
    friday: '00:00-23:59',
    saturday: '00:00-23:59',
    sunday: '00:00-23:59',
  }

  // Update with actual opening hours from backend
  if (dto.openingHours && Array.isArray(dto.openingHours)) {
    dto.openingHours.forEach((oh) => {
      const day = dayOfWeekMap[oh.dayOfWeek]
      if (day) {
        openingHours[day] = `${oh.start}-${oh.end}`
      }
    })
  }

  // Map category name to category type - use the category from backend as-is
  const category = dto.category || 'culture'

  return {
    id: String(dto.id),
    name: dto.name,
    shortDescription: dto.shortDescription || '',
    description: dto.description || '',
    category,
    address: dto.address,
    coords: { lat: 0, lng: 0 }, // Backend doesn't provide coordinates
    distanceKm: dto.distance,
    price: Number(dto.price) || 0,
    openingHours,
    rating: dto.rating || 0,
    images: dto.images.map((img) => img.url),
    partnerContact: {
      phone: dto.contacts?.phone || '',
      email: dto.contacts?.email || '',
      bookingUrl: dto.contacts?.bookingUrl,
    },
  }
}

let cachedAttractions: Attraction[] = []

function getWeekday(date: Date): Weekday {
  const value = getDay(date)
  const map: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return map[value]
}

function isAttractionOpenNow(attraction: Attraction, now = new Date()): boolean {
  const slot = attraction.openingHours[getWeekday(now)]

  if (!slot || slot.toLowerCase() === 'closed') {
    return false
  }

  const [start, end] = slot.split('-')

  if (!start || !end) {
    return true
  }

  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)

  if ([startHour, startMinute, endHour, endMinute].some((x) => Number.isNaN(x))) {
    return true
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes
}

function matchesSearch(item: Attraction, search: string): boolean {
  if (!search.trim()) {
    return true
  }

  const lowered = search.toLowerCase()
  return item.name.toLowerCase().includes(lowered)
}

function applyFilters(items: Attraction[], params: AttractionQueryParams): Attraction[] {
  return items
    .filter((item) => matchesSearch(item, params.search))
    .filter((item) => params.category === 'all' || item.category === params.category)
    .filter((item) => item.distanceKm <= params.maxDistanceKm)
    .filter((item) => item.price >= params.minPrice && item.price <= params.maxPrice)
    .filter((item) => !params.openNow || isAttractionOpenNow(item))
}

function applySort(items: Attraction[], sortBy: AttractionQueryParams['sortBy']): Attraction[] {
  return [...items].sort((a, b) => {
    if (sortBy === 'distance') {
      return a.distanceKm - b.distanceKm
    }

    if (sortBy === 'rating') {
      return b.rating - a.rating
    }

    if (sortBy === 'priceAsc') {
      return a.price - b.price
    }

    if (sortBy === 'priceDesc') {
      return b.price - a.price
    }

    return b.rating - a.rating
  })
}

// Get attractions from API
async function loadAttractions(): Promise<Attraction[]> {
  console.log('[Attractions] Loading from API...')
  const backendData = await attractionApi.getAll()
  console.log('[Attractions] Loaded from API:', backendData)
  
  if (backendData && backendData.length > 0) {
    const converted = backendData.map(convertBackendToFrontend)
    console.log('[Attractions] Converted:', converted)
    return converted
  }
  
  console.warn('[Attractions] No data returned from API')
  return []
}

export const attractions: Attraction[] = cachedAttractions

export const MAX_PRICE = 200 // Default max price, will be updated after loading

export async function fetchAttractions(
  params: AttractionQueryParams,
): Promise<PaginatedResponse<Attraction>> {
  // Load attractions from API if cache is empty
  if (cachedAttractions.length === 0) {
    console.log('[fetchAttractions] Cache is empty, loading from API...')
    const loaded = await loadAttractions()
    cachedAttractions = loaded
    console.log('[fetchAttractions] Loaded attractions count:', cachedAttractions.length)
  }

  const filtered = applyFilters(cachedAttractions, params)
  const sorted = applySort(filtered, params.sortBy)
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const items = sorted.slice(start, end)
  const total = sorted.length

  console.log(`[fetchAttractions] Returning page ${params.page}: ${items.length} items of ${total} total`)

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  }
}

export async function fetchAttractionById(id: string): Promise<Attraction | null> {
  // Load attractions from API if cache is empty
  if (cachedAttractions.length === 0) {
    cachedAttractions = await loadAttractions()
  }

  const numId = Number(id)
  const backendData = await attractionApi.getById(numId)
  if (backendData) {
    return convertBackendToFrontend(backendData)
  }

  return cachedAttractions.find((item) => item.id === id) ?? null
}

export async function submitBookingRequest(payload: BookingPayload): Promise<BookingResponse> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  return {
    ok: true,
    endpoint: MOCK_ENDPOINT,
    message: `Заявка для ${payload.attractionId} отправлена`,
  }
}

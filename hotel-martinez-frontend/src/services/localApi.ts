import { getDay } from 'date-fns'
import type {
  Attraction,
  AttractionQueryParams,
  BookingPayload,
  BookingResponse,
  PaginatedResponse,
  Weekday,
} from '../types/local'

const MOCK_ENDPOINT = '/api/mock-booking'
const NETWORK_DELAY_MS = 350

const attractions: Attraction[] = [
  {
    id: 'attr-1',
    name: 'Старый порт Канн',
    slug: 'old-port-cannes',
    shortDescription: 'Набережная с яхтами, кафе и вечерней подсветкой.',
    description:
      'Классическое место для прогулок на закате. Рядом рыбный рынок, уличные музыканты и вид на исторический квартал Le Suquet.',
    category: 'culture',
    tags: ['набережная', 'фото', 'история'],
    coords: { lat: 43.5505, lng: 7.0128 },
    distanceKm: 1.2,
    priceType: 'free',
    openingHours: {
      monday: '00:00-23:59',
      tuesday: '00:00-23:59',
      wednesday: '00:00-23:59',
      thursday: '00:00-23:59',
      friday: '00:00-23:59',
      saturday: '00:00-23:59',
      sunday: '00:00-23:59',
    },
    rating: 4.8,
    popularity: 96,
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 01',
      email: 'port@visit-cannes.example',
      website: 'https://visit-cannes.example/port',
      bookingUrl: 'https://visit-cannes.example/port/book',
    },
  },
  {
    id: 'attr-2',
    name: 'Музей Кастр',
    slug: 'musee-de-la-castre',
    shortDescription: 'Исторический музей в крепости с панорамой города.',
    description:
      'Коллекции искусства и этнографии, смотровая башня и спокойный сад во внутреннем дворе.',
    category: 'culture',
    tags: ['музей', 'история', 'панорама'],
    coords: { lat: 43.5513, lng: 7.0094 },
    distanceKm: 1.8,
    priceType: 'budget',
    openingHours: {
      monday: '10:00-18:00',
      tuesday: '10:00-18:00',
      wednesday: '10:00-18:00',
      thursday: '10:00-18:00',
      friday: '10:00-18:00',
      saturday: '10:00-19:00',
      sunday: '10:00-19:00',
    },
    rating: 4.6,
    popularity: 83,
    images: [
      'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=1200',
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 02',
      email: 'castre@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/castre/book',
    },
  },
  {
    id: 'attr-3',
    name: 'Пляж Бижу Плаж',
    slug: 'bijou-plage',
    shortDescription: 'Уютный пляж с пологим входом и видом на Леринские острова.',
    description:
      'Отличный вариант для утреннего отдыха и семейной прогулки. Рядом пункт проката сапов.',
    category: 'family',
    tags: ['пляж', 'семья', 'море'],
    coords: { lat: 43.5435, lng: 7.0339 },
    distanceKm: 2.6,
    priceType: 'free',
    openingHours: {
      monday: '07:00-21:00',
      tuesday: '07:00-21:00',
      wednesday: '07:00-21:00',
      thursday: '07:00-21:00',
      friday: '07:00-21:00',
      saturday: '07:00-21:00',
      sunday: '07:00-21:00',
    },
    rating: 4.7,
    popularity: 88,
    images: [
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 03',
      email: 'bijou@visit-cannes.example',
    },
  },
  {
    id: 'attr-4',
    name: 'Marché Forville',
    slug: 'marche-forville',
    shortDescription: 'Легендарный рынок Прованса с сырами, морепродуктами и фермерскими продуктами.',
    description:
      'Лучшее место для гастро-тура: попробуйте локальные специалитеты и свежую выпечку.',
    category: 'food',
    tags: ['еда', 'рынок', 'гастрономия'],
    coords: { lat: 43.5519, lng: 7.0121 },
    distanceKm: 1.5,
    priceType: 'budget',
    openingHours: {
      monday: '08:00-13:00',
      tuesday: '08:00-13:00',
      wednesday: '08:00-13:00',
      thursday: '08:00-13:00',
      friday: '08:00-13:00',
      saturday: '08:00-13:00',
      sunday: '08:00-13:00',
    },
    rating: 4.9,
    popularity: 98,
    images: [
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200',
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 04',
      email: 'forville@visit-cannes.example',
      website: 'https://visit-cannes.example/forville',
    },
  },
  {
    id: 'attr-5',
    name: 'Тропа Croix-des-Gardes',
    slug: 'croix-des-gardes-trail',
    shortDescription: 'Природный парк с прогулочными маршрутами и видами на бухту.',
    description:
      'Маршруты разной сложности среди соснового леса, идеальны для утренней активности.',
    category: 'nature',
    tags: ['природа', 'трекинг', 'виды'],
    coords: { lat: 43.5431, lng: 6.9992 },
    distanceKm: 4.2,
    priceType: 'free',
    openingHours: {
      monday: '06:30-20:30',
      tuesday: '06:30-20:30',
      wednesday: '06:30-20:30',
      thursday: '06:30-20:30',
      friday: '06:30-20:30',
      saturday: '06:30-20:30',
      sunday: '06:30-20:30',
    },
    rating: 4.5,
    popularity: 75,
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 05',
      email: 'trail@visit-cannes.example',
    },
  },
  {
    id: 'attr-6',
    name: 'Le Suquet Night Walk',
    slug: 'le-suquet-night-walk',
    shortDescription: 'Вечерний маршрут по старому кварталу с барами и арт-точками.',
    description:
      'Узкие улочки, камерные винные бары и живые выступления по выходным.',
    category: 'nightlife',
    tags: ['ночная жизнь', 'бар', 'прогулка'],
    coords: { lat: 43.5522, lng: 7.0101 },
    distanceKm: 1.9,
    priceType: 'moderate',
    openingHours: {
      monday: '18:00-23:30',
      tuesday: '18:00-23:30',
      wednesday: '18:00-23:30',
      thursday: '18:00-23:30',
      friday: '18:00-01:00',
      saturday: '18:00-01:00',
      sunday: '18:00-23:30',
    },
    rating: 4.4,
    popularity: 79,
    images: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 06',
      email: 'night@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/night/book',
    },
  },
  {
    id: 'attr-7',
    name: 'Riviera Old Town Guided Walk',
    slug: 'riviera-old-town-guided-walk',
    shortDescription: 'Small group walking tour with a licensed local guide.',
    description:
      'A 2-hour route through historic streets, hidden courtyards, and photo viewpoints with live stories about the city.',
    category: 'culture',
    tags: ['guided', 'tour', 'history', 'walking'],
    coords: { lat: 43.5528, lng: 7.0078 },
    distanceKm: 2.1,
    priceType: 'moderate',
    openingHours: {
      monday: '09:30-18:30',
      tuesday: '09:30-18:30',
      wednesday: '09:30-18:30',
      thursday: '09:30-18:30',
      friday: '09:30-18:30',
      saturday: '09:30-18:30',
      sunday: '09:30-18:30',
    },
    rating: 4.8,
    popularity: 92,
    images: [
      'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=1200',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 07',
      email: 'guides@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/guided-walk/book',
    },
  },
  {
    id: 'attr-8',
    name: 'Lerins Islands Boat Tour',
    slug: 'lerins-islands-boat-tour',
    shortDescription: 'Half-day island trip with captain-guide commentary.',
    description:
      'Boat transfer, guided stop at Saint-Honorat, and free time for swimming and monastery gardens.',
    category: 'nature',
    tags: ['guided', 'boat', 'islands', 'tour'],
    coords: { lat: 43.5362, lng: 7.0252 },
    distanceKm: 3.4,
    priceType: 'premium',
    openingHours: {
      monday: '08:00-17:30',
      tuesday: '08:00-17:30',
      wednesday: '08:00-17:30',
      thursday: '08:00-17:30',
      friday: '08:00-17:30',
      saturday: '08:00-17:30',
      sunday: '08:00-17:30',
    },
    rating: 4.9,
    popularity: 95,
    images: [
      'https://images.unsplash.com/photo-1468581264429-2548ef9eb732?w=1200',
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 08',
      email: 'islands@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/islands/book',
    },
  },
  {
    id: 'attr-9',
    name: 'Gourmet Market Tour With Chef',
    slug: 'gourmet-market-tour-with-chef',
    shortDescription: 'Guided food route with tasting set in local market spots.',
    description:
      'Chef-led tasting session focused on local cheese, seafood, olive oils, and seasonal desserts.',
    category: 'food',
    tags: ['guided', 'food', 'market', 'tasting'],
    coords: { lat: 43.552, lng: 7.0125 },
    distanceKm: 1.6,
    priceType: 'premium',
    openingHours: {
      monday: '10:00-15:00',
      tuesday: '10:00-15:00',
      wednesday: '10:00-15:00',
      thursday: '10:00-15:00',
      friday: '10:00-15:00',
      saturday: '10:00-15:00',
      sunday: 'closed',
    },
    rating: 4.8,
    popularity: 90,
    images: [
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 09',
      email: 'foodtour@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/food-tour/book',
    },
  },
  {
    id: 'attr-10',
    name: 'Family E-Bike Coastal Route',
    slug: 'family-ebike-coastal-route',
    shortDescription: 'Safe bike route with guide and scenic stops for families.',
    description:
      'Electric bikes, helmets, and a guide are included. The route has multiple kid-friendly pauses and sea viewpoints.',
    category: 'family',
    tags: ['guided', 'family', 'bike', 'outdoor'],
    coords: { lat: 43.5478, lng: 7.0234 },
    distanceKm: 2.9,
    priceType: 'moderate',
    openingHours: {
      monday: '09:00-19:00',
      tuesday: '09:00-19:00',
      wednesday: '09:00-19:00',
      thursday: '09:00-19:00',
      friday: '09:00-19:00',
      saturday: '09:00-19:00',
      sunday: '09:00-19:00',
    },
    rating: 4.7,
    popularity: 84,
    images: [
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=1200',
      'https://images.unsplash.com/photo-1520975954732-35dd22cf28d1?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 10',
      email: 'bike@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/bike-tour/book',
    },
  },
  {
    id: 'attr-11',
    name: 'Sunset Photo Tour With Guide',
    slug: 'sunset-photo-tour-with-guide',
    shortDescription: 'Golden-hour route for travelers who want the best photo spots.',
    description:
      'A photographer-guide leads you through 5 scenic points and helps with framing, composition, and portrait shots.',
    category: 'culture',
    tags: ['guided', 'photo', 'sunset', 'tour'],
    coords: { lat: 43.5531, lng: 7.0142 },
    distanceKm: 1.4,
    priceType: 'moderate',
    openingHours: {
      monday: '17:30-21:00',
      tuesday: '17:30-21:00',
      wednesday: '17:30-21:00',
      thursday: '17:30-21:00',
      friday: '17:30-21:00',
      saturday: '17:30-21:00',
      sunday: '17:30-21:00',
    },
    rating: 4.6,
    popularity: 86,
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 11',
      email: 'photo@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/photo-tour/book',
    },
  },
  {
    id: 'attr-12',
    name: 'Night Bar Crawl With Local Host',
    slug: 'night-bar-crawl-with-local-host',
    shortDescription: 'Curated nightlife route with skip-the-line partner venues.',
    description:
      'Meetup with a local host, welcome drink, and a social route through stylish bars in the old quarter.',
    category: 'nightlife',
    tags: ['guided', 'nightlife', 'bars', 'host'],
    coords: { lat: 43.5516, lng: 7.0114 },
    distanceKm: 1.7,
    priceType: 'premium',
    openingHours: {
      monday: '20:00-01:30',
      tuesday: '20:00-01:30',
      wednesday: '20:00-01:30',
      thursday: '20:00-01:30',
      friday: '20:00-02:30',
      saturday: '20:00-02:30',
      sunday: '20:00-01:30',
    },
    rating: 4.5,
    popularity: 81,
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 12',
      email: 'night-host@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/night-crawl/book',
    },
  },
  {
    id: 'attr-13',
    name: 'Perfume Village Day Trip',
    slug: 'perfume-village-day-trip',
    shortDescription: 'Guided transfer to hill villages and perfume ateliers.',
    description:
      'Includes transport, guide commentary, and an atelier visit with optional workshop session.',
    category: 'shopping',
    tags: ['guided', 'day trip', 'shopping', 'perfume'],
    coords: { lat: 43.6582, lng: 6.9251 },
    distanceKm: 19.8,
    priceType: 'premium',
    openingHours: {
      monday: '08:30-19:00',
      tuesday: '08:30-19:00',
      wednesday: '08:30-19:00',
      thursday: '08:30-19:00',
      friday: '08:30-19:00',
      saturday: '08:30-19:00',
      sunday: '08:30-19:00',
    },
    rating: 4.7,
    popularity: 87,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200',
      'https://images.unsplash.com/photo-1495121605193-b116b5b09a27?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 13',
      email: 'village@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/village-trip/book',
    },
  },
  {
    id: 'attr-14',
    name: 'Morning Yoga and City Stories',
    slug: 'morning-yoga-and-city-stories',
    shortDescription: 'Light yoga session plus a short guided history walk.',
    description:
      'A calm early-morning format combining wellness and local stories, ideal before breakfast.',
    category: 'nature',
    tags: ['guided', 'wellness', 'walk', 'morning'],
    coords: { lat: 43.5488, lng: 7.0197 },
    distanceKm: 2.3,
    priceType: 'budget',
    openingHours: {
      monday: '07:00-10:00',
      tuesday: '07:00-10:00',
      wednesday: '07:00-10:00',
      thursday: '07:00-10:00',
      friday: '07:00-10:00',
      saturday: '07:00-10:00',
      sunday: '07:00-10:00',
    },
    rating: 4.4,
    popularity: 73,
    images: [
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
    ],
    partnerContact: {
      phone: '+33 4 93 00 00 14',
      email: 'wellness@visit-cannes.example',
      bookingUrl: 'https://visit-cannes.example/wellness-walk/book',
    },
  },
]

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
  return (
    item.name.toLowerCase().includes(lowered) ||
    item.tags.some((tag) => tag.toLowerCase().includes(lowered))
  )
}

function applyFilters(items: Attraction[], params: AttractionQueryParams): Attraction[] {
  return items
    .filter((item) => matchesSearch(item, params.search))
    .filter((item) => params.category === 'all' || item.category === params.category)
    .filter((item) => item.distanceKm <= params.maxDistanceKm)
    .filter((item) => params.priceType === 'all' || item.priceType === params.priceType)
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

    return b.popularity - a.popularity
  })
}

export async function fetchAttractions(
  params: AttractionQueryParams,
): Promise<PaginatedResponse<Attraction>> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const filtered = applyFilters(attractions, params)
  const sorted = applySort(filtered, params.sortBy)
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const items = sorted.slice(start, end)
  const total = sorted.length

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  }
}

export async function fetchAttractionById(id: string): Promise<Attraction | null> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  return attractions.find((item) => item.id === id) ?? null
}

export async function submitBookingRequest(payload: BookingPayload): Promise<BookingResponse> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  return {
    ok: true,
    endpoint: MOCK_ENDPOINT,
    message: `Заявка для ${payload.attractionId} отправлена`,
  }
}

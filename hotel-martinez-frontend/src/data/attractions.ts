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

export const attractions: Attraction[] = [
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
    price: 0,
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
      'https://alliedyachting.com/wp-content/uploads/2019/01/CANNESOLD_PORT__FRANCE_1306282779.jpg',
      'https://alliedyachting.com/wp-content/uploads/2019/01/CANNESOLD_PORT__FRANCE_1222959056.jpg',
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
    price: 25,
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
      'https://parisgid.ru/wp-content/uploads/2014/06/Mus%D0%B5e-Castre.jpg',
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
    price: 0,
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
      'https://beachsearcher.ru/images/beaches/250201369/FR201369-p.jpg'
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
    price: 20,
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
    price: 0,
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
    price: 55,
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
    shortDescription: 'Пешеходная экскурсия в небольшой группе с лицензированным местным гидом.',
    description:
      'Двухчасовой маршрут по историческим улочкам, скрытым дворикам и фототочкам с живыми историями о городе.',
    category: 'culture',
    tags: ['гид', 'экскурсия', 'история', 'пешком'],
    coords: { lat: 43.5528, lng: 7.0078 },
    distanceKm: 2.1,
    price: 60,
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
      'https://french-riviera-blog.com/wp-content/uploads/2012/03/110927-late-september-2010-045.jpg?w=1024'
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
    shortDescription: 'Полудневная поездка на острова с капитаном-гидом и комментариями по маршруту.',
    description:
      'Трансфер на лодке, остановка с гидом на Сен-Онора и свободное время для купания и прогулки по монастырским садам.',
    category: 'nature',
    tags: ['гид', 'лодка', 'острова', 'тур'],
    coords: { lat: 43.5362, lng: 7.0252 },
    distanceKm: 3.4,
    price: 125,
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
      'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/11/fa/4e/ec.jpg',
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
    shortDescription: 'Гастро-маршрут с дегустациями на лучших точках местного рынка.',
    description:
      'Дегустация с шефом: локальные сыры, морепродукты, оливковые масла и сезонные десерты.',
    category: 'food',
    tags: ['гид', 'еда', 'рынок', 'дегустация'],
    coords: { lat: 43.552, lng: 7.0125 },
    distanceKm: 1.6,
    price: 145,
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
    shortDescription: 'Безопасный семейный веломаршрут с гидом и красивыми остановками.',
    description:
      'Включены электровелосипеды, шлемы и сопровождение гида. По пути — остановки для детей и смотровые точки у моря.',
    category: 'family',
    tags: ['гид', 'семья', 'велосипед', 'прогулка'],
    coords: { lat: 43.5478, lng: 7.0234 },
    distanceKm: 2.9,
    price: 50,
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
    shortDescription: 'Маршрут на закате для тех, кто хочет лучшие фототочки.',
    description:
      'Фотограф-гид проведет по 5 живописным точкам и поможет с кадрированием, композицией и портретными снимками.',
    category: 'culture',
    tags: ['гид', 'фото', 'закат', 'тур'],
    coords: { lat: 43.5531, lng: 7.0142 },
    distanceKm: 1.4,
    price: 65,
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
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFRUVFRUXFRUXGBcYGBYXFhUXFxcXFxUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy4lHSUtLS0tLS0tLS0tLS8tLi0tLS0tLS0uLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAADAAECBAUGBwj/xABDEAABAwIDBAcGBAQFAwUBAAABAAIRAyEEEjEFQVFhBhMicYGRoQcyUrHR8BRCweEVktLxQ2KCk8JTY3IjMzSj4hb/xAAbAQADAQEBAQEAAAAAAAAAAAACAwQBAAUGB//EADMRAAICAQMEAAQDBwUBAAAAAAABAgMRBBIhEzFBURQiYZEFofAjMjNxgbHBQlJi0fEV/9oADAMBAAIRAxEAPwBGq6YKd9xKizEN/MSR6rWo16AaI+RX0UpY8H59ChS84MNgk3VxmE4FaNXBB4zUw0jdFigFhZHY70PUQz4eWfoBOHcCiYQEktIRX4skA+ihQrFx0grHZwFHSpSJjASVn4zCduPJbuEkz80DEsk2EnilO1no06WK5wZAoWRaNJHqNTUUmcz3NNTwHp2uP2RBXJ1NlINR2UmzxUzsRaqQUmPkpMpk7kekyTyG5aDKTQJ380t2BKCRkNZeER1Hkr9RrN4id4UerjQyp5yKYFKnTVqm1EFONVHRIlIclkTgmoCSnhWMKwNMlYpHNcAMTRKWDwMnih43FSSBxWpsmYkbkSkKkmkNUwwBghKGiyJiq14NidypExJOvBdKYEYZFX9FVeil06+SG5KbKIxBZVNlBEYFMNWI6TI5EP8ADtNyFYfVj3QoiX3CqrwRWZKwoMCKdnsIkBRdhHA3zHh+wVltYMHaB/VUc+CKTXky62zjNgq78EtaviW7nRy3rNxGJI0Kqrc2ebqOnDkqHCcj5pKjV2mATL06p2S9nl/Ew9MygURtRQFKybIVa5IndEsZwamzdp5DB0+S6CnjKdVt1x7aUq1h8zdCVPZXF8ruWaZzj8rXBu1sM0C/mspxLCQCYla1HGZm5T5qriaQ3JCbXc9BUptYQPC44tEFWG1wb3BVHIjMaglJF9emCkyp0qaVOmrNNqjtsPSqqwEpU1ZDQENgRGMlSuZRsJMrncIUnucRyUm4e+qPo2N6FyM2orspGO1CPSypMylmkulRbR8BvS3IJInXII3WVOoVPE1AdEEBJlIfCHAWmiVmGJUaRVlmHL9TAXJmSRmUKGZ0LbpuDBlG7XvR9l7PaDJGmir4+JdxRp4QqXzPBQeSXTM8ZRKjgB+6HKZzkDkGoDNEo1KiN5QA5M5xQ5CaZbbUaNd2nNSdjAdGaLPa1x0EqwzDPBALdd37JsFkRZhdyvWrFxvedwVqk4t3ZR4KyKOUWAnidVSxGFe6SSAN0qyFZ51t3oFitsFoMDTeSsLGbcqHRo7wrj8I0WkHvv5ItHZjCJIJ9B5K2EEebdazm3Y+s90ZfAfqVNuz6z/fqZW8BqujOGA0AHIBVcQwhVQijyb7mucGY3YlLmef2U6mWnj80k3YvZB8V/xMoU3eHBM1rgtUvB1b4j6JGmNyxzPdhTjGShTVlhSdRT02pUp4PQqojIPTBR2ncoMarLGKeV5bDSpAw1GaxTa1GaxS2W5K4V4BNYjManDVMKaUx6iTYEVqE1ymCkuQxQLLSN9uacOGhuNx3+KquJUWod5vSND8KABlIv8Ad07rCCg0akXTYmuXLHIFQeSpVF7JNTNU4SHIpUeAtFslarBAl1lW2axs3KPtXFCMrfNHF4WRE03LCLL65Y3v0CxcTUJMpm1nHVDddZKw2FWCIU4Ttaj0mDel5yMaSKsK5hsATqJHBHYWN1TVdpsaDlESnQSXcnnJvsWg3IIFu4qFauBHaM6k2PhdYOJ2lJu49wWbW2i6TA87lPVqRPLTSlyzaxeMadXO84nwAVDHYouH5iNN8etlXw9SbucG92vmrtKnS+InvmPRNjaInQolPBECbR+qNiccR+cDdG8/RW6uEYYyvI7hCoYjYocbNc7xv3qhXbURSojORHC7UY7V4+XopPeH2a6VLBbG7QmkG83ZT6Ak+a6BmyaMX36wIn5JkdX6I7fw6D7s4x9VgMdYLcwPSUl1A2FghYYan5M33+FOmfGz9E//AMrT+2cplBUS3nZEAUKncVy1KPoPgWQhFptUGORmVEE700Or0ziGphGCAHKbXqOUyuNZZY5GaVVa5FaUiVg1VBwU6GHKYSnYGqyQKIENTalOYaiEAUhTSYpOQ7ztpBxhQcVJyiglaFGsjTRQoMCIAl9RBOBIFRN0lILHcjOmRISFNSlOXrOqbsFEJs6iXJutaCjjMCUR+rc73ZKKNjVD7wIHgrGHxzG8T3CAjO2pPuUnv8/mnKUfJLNz8IzzsHl5mFaobGpj8rSR3lJ2LxE9mhHAl0LNrtxjnxlH8ziPNb1UuyFuM5d5Jf1NZ+z2bms+fyCZmCbv04CB9UPB0a4P/qFkcpn1V/Iq65J8s8y+Uo8J5K5wzBfLPff009Ez8o/I3yHyVhzShOpcSqo7fJDKU32ZXfVdyHcAPkhmsd6k/EUwYBnu+qq1doM3A95sj6sECqLpdgvWJKsccOCSzr1hfB6j0YraaZzFKnVCTnBQuZ9aoAHUVHJCtNUjTQdVhqKKUqQcrDqKH1SHqhKKE16s06irhikwIXM3aXWooValUVgFInMJRJtTpgnlIdgagEa5EzKrnT9YkTvSCVYVzlDMhOcoGopZatDFWWqb1MvVFtVS6xIlqzXWWS9OXKqKgRaWIaLkE+MJfxMmY4NeAmZQc9J1Z9Q9hgA5X9U78DUH5XOO8ASRdErbH2M4X73DIAkmACVp4PZoN3PyngIWtsvZYDBmZBjx8eabaVVlL8g7yf0Xq1wlCO6Z589Spy2QQH8C0fnhWaZYP8T5LncTtibBoHcFQfjHFOjfEF6WclyztH12fEChVMa0cPRcb1j+JTFjjqSmq8V8CvLOt/H0+PyUa+06TRxPBcq3Ck8VYp7PJ4o1cwHoYeWWsTt2bNZHMn9AqFXFvfqT3K43Z4GqmaDRpdGrJBLT1R7IoU2lHZh5VgdwUjKLLZzSXgB+E7kkTq+aS3D9mZMBgBOkIv4bmjNKnZC5Iu5AtokI7KJKYJxUS3JI1JsJ+HKm3DIYqlSGIKVKaDUWSOGCC/Do7a0qRcEl24DUGUS2E7Xqw8BBcxInqF5GqAdj05KrNKIHKSd6fZjNuB3lDzLmumnSd2DawMYHvqZozTlaGxJIFye0PVF6G7edjaTnOYGvY7KQ2YMiQQDcb7XS56e509d/ugK+vqdPPJvuchFy3Nn9HqjxLuwOa16PR6i0QTJ4/wBkiFFko7kuPb4X5i7NdTW8Zy/ocdSaSj0sK5xgAkruaOGo0xGVvl9VmdIekWFwdI1azwxk5RlEucTJygCTNimfDPhbll+Fy/yJpfibf7sTFfsl7feAHMkfVCY2mPeMnxVnoT0uwu0C/qqeRzPea6MwYSQ1xtBmN2nqeqdgw4e5HeGn5o1oLdzWOV45FP8AEGuJfl+mYWExTAYL2MaN5c35AynPSigx2UGo4D8zQIPmZPeqe12GlUcX4anVbaIcWnyaP0WZjMQHA9XgsjfjzEmeFxCZXbKEc5WV48j4aeFuJNNp/WOP75NnaHShj2QwPDptMacbLDxDnuPaJHIygjDVd7I7/S2qssw1Q7vmkXXyseWyuumqlYhj7kadAHfHD9yrFPD/AN0ZmAi7jHI/OOCM5rWgXHgQfMbk2mTS5FysTfATB4EP0cB328O9GfgQ2bi3P6KiMRe0+CTq5P3KthMRKE89+C5lA4JOq8CqEFEaCq4SQuUGWHPPFDISaCpgJykLaBhifKjBql1SJSAaKpaUlY6pJFvBwYICI0Stk7Nb3Jv4XexXjPVM9DqVmUWJi1bB2SeKapsh25BLVSwaravZilqgZWnV2M+QIN9Ehs1wsWnyUstbP0N6lXsyw4phXW7S2Q535bc1N3RkajXhuS/iJy8Mz4qmL5ZgGokypwXSf/zbYifvzUqPRpjZh2u/glvc/DMevox3ObpPXRbP2UHtBNgjt6PszB0zCy/abiq1HZ1V9F3VkOpguaSHBrngGCNDceqOnTytsUWsEt+rVjUa33PP/bTsWhTFCo2oDXksdTBE9XdwcRqINuebkqfsv2/h8E0CpSc6rXrtaHggBjRlb2gb2LnHRcJVqOcSXEkm5JuT3lTwOKe2CHOADw5okwHDRwHHmvqlpF8MqJPKQtVpz5fL8n1kAZifJVMbjaNEtFavTpF5hgqPDMx4NzG+o81Q6Ebc/GYNtac1Roy1W6HrGj/lYjv5L536XYrE1sS+piQ8PLiMrg4ZIvkaDoACLc+ahp/DlP8AiLj+b/7JFRPdJPx3PqEs5grzP26bJNTBMrh0dRU7TZsW1YbMb3A5fAuQvYvjceSWVhUfhMhLalTNFMtsBTc7VpgjKJAjdeeN9onTavjC+nmDKAf2KQbdwaey57jed8aBHT+H9K+M4Pyd0ZptPx/n/Jc9gGHnaFR8wGYd9uOZ7B9+C+hQ4L45wmOfReH0aj6bx+Zri0jlLdQvdfZd0zfi6b6dZwNalBDoAc+mbBxHEHUjiPG3XaqzTRdu3MV39oQ6t3Y9NqtO4qvJBl2WeMAeqzq22A3f+iy8Xtek7UAn/MbfNfPaj8UhZJTqUs+Vnj7DqtJY/HBrY/aeHYxxdUacoJIEONhNhvXh9X2rV/xean2MMHZQzLTDsk3c4hpJO+AeU716HtjpBgqFN/WljnlrstKm0uLpBABdoJ4kr50K9L8MqjqFKdkMeF3/AK/+h2LpcR/NI+jTVc+5JM3Um0+SubL2jRq02upPOSALC9hoRaCrT6nB5jnIXkqqUXyekr3jCRmik74SPBFbSPAoz6gG9SFcQnR3HOcvRBtM8ERtJMKo4hS60cQq4bhbbJCmUZtAKucQOIUTiB8SpipMVIudV3eaWQcQqBrD4kM1hxKcq5C3Jey+QOITLNOIHFJH0pGb4nkzemu0AZ69/wDLT/pUanTnGD/HeTwho/RYrKZI1H34KntEGzQQeMaff1VPTok8bF9jHbJLJ0lP2h48aVfQFWR7TNox77PFn0K5HAYckzFgdbWMc1dIvFp7xPlKVLT6fONi+yOVkpcs6Gj7S8eDdzHciz6EK0Paji9TTpT3PH/Nck8gbk9Noc2RBMxF55nh6pMtHppcutDFM6uh7Vcc0uJ6twcZaC0wzSwIIJHfxSPtW2hxpfyH+pcuKB+Hzt67lANHwrvhdP32Ix4/SOsHtU2j8VL/AG/3VnZ3tXxrXzVDKjYIy5Qy+45gCbfquKzNG5QbixB7JBiy16WmSxsR2YeUvsekP9reIJ7OHpAQdXOcZ3GRFuXqltTp5+KwdahiaA7TD2qbiAHN7TDldOjmjfovOsNXIF2yZ5BHxm0MrCAwS7s66EjelfBQUkoR8+w10kstGFUqbh3LQ2cxuZmYS2RI4ibhZtPWOHqVr4NsuaOY+a9G3hYQzQ5sm5SPV8ftjDbMwdcYN1VtWu9uQPg5ANcpG4NJEm9wvI9o7RqV6pq1Xl73HtOcZJtA9AF0nSLa4q4d7HNbIyljrSDmFxc6iR4ripU2jUnX8/cHU2qufyvOec+fX+D1ro102qt2bXoOLYYxtOluf23EOHMBpPMSF5njcQCXgOIHA9qeUrS2S9nUxlkl0PMnSQWgQYabG/I7isLE03NJmRNxO9smD6JtUfnefB19senmKS3cvH2K7gux6FYt+Er4esCCKzXtHC7shaeNw0rjsy39lYu1DMDFEvIvEy8OEE21B8keqhvrcX2ec/Zkuna38/r9I9ZrdK3g3aJ5AfRUsRtzrPeb43/Rcr/Hw6eyJ/8AIIbdvE6U/MgDWNV8/X+GxX+k9jrVReYpIj0hZmqO4EN47wAuP/hVUvLQ02uN0jlK6jaNY1Ays6QCcpFsrb9lx3kyAPDmjVa4aAGyXRoIgHW5Fzxjf6r2qG64pHk6n9pPcdh7OWZaNQOcAWua0idHNYM3zF+S6h9RvxDzXkzNoVsK59IAhxcHOBMGXNDptbQhDf0oxO8O/md9EmVKnJywNjZtilk9WNZvxDzTZ2/EPNeQ1Ok+JBGoniXaHfEpHpLidM9+ALp+aKOnSMd2fJ6+KjfiHmpS34h5heNjpJiz+Z487+qY9IcXEmpUEa8k5VRQpzyey9n4h5hNnZ8TfMLxlvSPFHSvUI4jTzSdtvFn/HfpNnJqUV3Eyyz2U1WfE3zQ3VmfEPNeM/xjEEXxFXhGch1uI+9Ex2jiN1bEeL3AXjmmKUEKcJM9iNdnxfNJeMOxtXfWrfzu+qSPqw9MzpS9lhtaput5RwvqgVGlzpdc95iy7o7RrbzT1t2G/wBP3Kb8fWn3mf7bP6V56bXgqwvZxTKIBsRfcRoZQ3OyH3h4Su7/AB9XjT/22f0pzjan/b8aVM+pat3S8oL5Tzw1pMzPMp/xNwJEeC9COKq/9vv6ql/QpDF1eLP9un/St3P/AG/2Nz9ThQ9p0julM2OHy8F3v4ur8Y/lb9FIY2r/ANQ+EIcy9B7onDuLT7zA7kRPlF0hg5AJpnQflqE2AG6y7puOqj/GqfzH6pHHVP8Aqv8A5z9Vycl4/M5tNnD08IAfdi3wvv8A/b+izdtvc0hsBoIBiLm8XmSNOK9HfiJ96oT3uK5/b2wqVaHipkeARPvAgaSN2+/NHXJ7syBs5j8pxGGIGq1MDXaHsuPeb8wqOxsK2rVYxxIBzSRqIY4j1AQMTTcxxa6zmkg9/EKqUFJ4Bp1k6o8JHSdIajabQzKQ8zJMaGRaP20XOBwK6jptjGupUAGgF3aJgaBotOurvRYLtmxhOvOrqrWt/wDANfJ8XAD/AE80qlKMFkXqPnnx4Rq9F3yKrA0OkNIBEwRI0j/MfILSr4MF/ap5SQOzG7TyzZvNV+gzSxlSoI7Tg0SNzRJ3/wCb0WltHGw5jnaXbO4ToIPG6Wmuu1kqpi1UmVMLgKD3kdW0OaRIIG/f98RzRavR5we6CBSygNBLjuHeRBBQamJaKweDYga203X5QjbS2mHPJFxaINvdEplsvlwvYLWGSfsVgAhzQQRMEnfcad6C3ZdIH3nHkORJ/X0QKFd9R2VjHPd8LAXHyAXQ7M6L4mqMxDWNOmZwJPg23mQps4XLOTb7HCbXx72VKtJjz1ZgZTe0NO/S97JM2hWY0BrsrwydGmWFuYXIMENM93cFqdPejbsPiGjMHdZTDpjKAQS0jUzoDPNZ2yNg1auJbhw4NJeabnXsBIfbf2QbKyMoOKZLKM8tHS1n0/ec0kkSSS4kzc71m4uuBdgyCNSBN98a79F31XoBIj8SWx8LI/5rD6S9FzhqYe6oKzXOyxlDSLEi8m1vkoU+clj7YOAq1L2cTOpO/wCyreHo1SAWxy90fNHFNpsaIE2kGT6b1I4F5NqhGkaifTVUOxE6q8gJqtdBue9pHoY81OtVDJ7UF2sCZjiJUjs2q2Ye2SPecTMb93zTN2QfzPbz/ZDuh7C2yS4RRfiJtm8hA8lJgcDr4jT7utD+CsizvUJq+HOTK3Qd3mt6kHwhfSl3Zn18STYHTembjnC0qX8Lfy7zKIzZB+IRy39yPNaQGyxgW4o/cfROrY2TH9p9Ulm+s7o2HZdYzkomszl5fusY4lQNdEonbjbOMam/iDVhGskay7CO3G07aI4KLto8AsXrSlmK7CNya/8AEChu2g5ZZPNIuQhJl4408VE4o81RL0utWMJMufiCk6oSCCYkH5KkayWclCGjH6POArNP+V3y/uj9JwC9rh+ZsHnlP0IVLZjstVo7x6EK7t42YeBd6gfRUSeLl/Inj/Bf8ypWqGs+kzTKxjB4C5++C3ukNZow2RogBzAByG70WNsDCvq12hjS5wDjA7iJ9QtXpnsurh2UhVABqFxAmTDAJJiw99LsSdsY+uRlbaqlJ+eCWwK0UAObj6/sn2nJpuMEgFsm5A7QFzuXcdGOiTadOgX0muJY11TrHmznDMWtptaQYned3iuh6TbJZVwdejTaAXUzlaABLmdtg04tCic49bP1LVnpJfQ8s/gNWphHYkZerpydSXS0iRAFtd8LoOhuxKGIo9a5he9ri1wc4hgIgjstgmQRrImUf2c4dtfZ9ek90CpUezdaaTBInn8kT2W0stCuHwIrZTPFrRP6Jlje2S9MyK5X1Ogw+zC3SKbd1JjSGAjQwAO1zVsNeDd7/VWHUt4yeX7ps7hoR6/1KdNhuKOB9qDf/jOLiTNYCeEUynwjBR2uyHDLVaHNdbWpSyz4uB81o+0jCuqYUVNTRe19gfdPZdv5tPgsKjRc/F7NOubD0T4Uy9x9AFVHmH3EvueoNcZu4Ed4VPpBhhUwtVtpDcwuNW9r9IUzVduE+LgkMQYMgRvu76JRrR5C5sanfqL/ACUqR4m0WP6Ie0cIKVZ7WgdlzgOETb0hQDzw8kTQPIcMFpbPKbbrzF0DFUyTMhosAPBWc8RIgRrG7fqjU3jS08b6fJDlrk7GeDMo03tPvE/6Y+ask74g8d/91dLoJHvRpp5TePVC6w37MGDrv8YXOWTlHAEYjg0c5F/OVCpW0sNbnf3qwXk3IA++O9U8Tg82pju+7rVjPJks44Dfi2nifP6JlROzO/1CZHsr9iv2hcbKdCzpZuJVROFzBMSglw3JF5XGB8xUXO5quDPFMWoQgxqKBqoceKYuWZQWGFJTSlh6NSp7jHO5xb+bQLbwfRGs8S9wYOGp/QD1Qykl3GRi32MMPR8LRfUMMY53cCR4nQeK7LA9FqLYlheeL3Aj+Ub/AAWtWphjYFo0ABA+vySZWeh8avZ5DT2dV/FtolhFQ1QMoue0Z3a9kyuv6V7Ap0sE5+SqKjXsINQtFi4Ns1u4h03utPA7FmscQT2pMHfPzhE6S0TUp9W4l0kE6xY29R6IrNQ3ZHC7dzIUJVyy+/Y5T2a7QoUcQ91aoKc04a4uj8wJGnIbxoLHds9P6L8RXpAvztpsLm9huUl75LTkLbEMb56oOC2BmcNbb5iAtbFs/wDWEgEAtBkiNyC2/Fu+Po6unNW2Xs6/D7Uc5rTYdkT2bTGg7VvVVtqbd6qm6o64aCYDDeN3vqFN7uA7hlQcZhnOEFsgyLAfovPU3nsej04pcHIez/bjmuxDSGhri6u1ognMTDmhoMgRlg6WVj2cY5569ry2XPFQt7QdmcTnuRG5tgp09lnD1A4Njw3cFoPoOY4VGDXdB81bO1S3YXfH5EcYNJZfbJvOP+UeLv8A8phXcBo3zJ/4qlRxhIn0U+uM8vvklIc8HPdOtqYgU+rpsOV7XB7gJN7ZSDuIJuuf6I7QqjF0TUY/IymaTST7jcjtLAXPzXoFSDu+/JUHYJs2EeAVMLsQ24JrKm5bkze/iIAs1x/l/qTs2lP5PP8AYrLodnX5BX8Ph6T9Xlp4QIPiCl5YXBw/TBg/FFwGXOxjoi0gZCL30aD4rDPeu06dYBoZTqsdmyuLXW0DtPUR/qXI5hvtb+88EeTEkDoyN+vr6W80Quk3n0lCqh02JIjkN3DelTeTbQ81uPIJYZIPDw+ilLyQARF5FjP0QjW1v3fe8KUNdeIPKQfPRDg1/QNlNxpygR5z9EN1aq0HKQ0xEQIvrcTaLKVKW6VCNdb68Yvv80QSb6xqA6Y8LFYcCpY2oABFPTeAfVJN1fcf9CS7j0ZyUCErJJKvJHgYujcmzpJLTERL0+HY6o7KwSeFh6mEkkEnhNhxWXg3tm9EqtX3nAcm3I7yf0BW/g+iNFhBMuPCx9XD5AJJKfe2VKCRsuwwZGSG+BPhMiE34940p0zG85p8y5JJCNQF+2Km+m3wcR6ZSs6tj3vN2+AI/WEklsewE284LtPHBrf/AG3x/o/qWbiMY1zpIIniB+iSS6Pc6bfY1sHjsM0Q4nmYdr4LOxWKouqEtNptZ2gTJLHBBub7HU0HUCJZfwI+ar4hwJhrbeCZJJcVkepPBn4zCgt0ghBwZBblJP7JJIkBLuTZ2HRJgq4XH4ikktQA0nj6D6Jmtcfh8gkkiODMpui7WnwUm0SPyt7vspJIkLZU2vSz4eqyBPVvI11aMwjxAXnXWDeImII3nmEySPGQYMid19eH3ZIdoQT48Y5JJLvqE0SbQJUH07wYtp/fikksUmwWuBM5X33+7p21i0y6/I8dAOSdJF3eBbGbtKoRJI9d1gkkki2x9A5fs//Z',
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
    shortDescription: 'Продуманный ночной маршрут с партнерскими барами и приоритетным входом.',
    description:
      'Встреча с локальным хостом, приветственный напиток и дружеский маршрут по стильным барам в старом квартале.',
    category: 'nightlife',
    tags: ['гид', 'ночная жизнь', 'бары', 'хост'],
    coords: { lat: 43.5516, lng: 7.0114 },
    distanceKm: 1.7,
    price: 135,
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
    shortDescription: '',
    description:
      'Включены транспорт, сопровождение гида и посещение ателье; по желанию — мастер-класс.',
    category: 'shopping',
    tags: ['гид', 'выезд', 'шопинг', 'парфюм'],
    coords: { lat: 43.6582, lng: 6.9251 },
    distanceKm: 19.8,
    price: 150,
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
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIP2qlHDnIOxXw7tARvm-r5tq4kEFHCdamjA&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo84K6lRC2W6PPvpfEAkUnGWc2bE9DwewDug&s'
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
    shortDescription: 'Легкая йога и короткая прогулка с историей города.',
    description:
      'Спокойный утренний формат: немного практики и локальные истории — идеально перед завтраком.',
    category: 'nature',
    tags: ['гид', 'велнес', 'прогулка', 'утро'],
    coords: { lat: 43.5488, lng: 7.0197 },
    distanceKm: 2.3,
    price: 25,
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

    return b.popularity - a.popularity
  })
}

export const MAX_PRICE = Math.max(...attractions.map((a) => a.price))

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

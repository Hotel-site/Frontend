import type { Service } from '../types/service'

export const services: Service[] = [
  { id: 1, title: 'Номера и люксы', description: 'Панорамные виды, премиальный текстиль и индивидуальный сервис.', category: 'Проживание', icon: '🛏️', popular: true },
  { id: 2, title: 'Пентхаус-апартаменты', description: 'Просторные резиденции с террасой и видом на море.', category: 'Проживание', icon: '🏙️' },
  { id: 3, title: 'La Palme d’Or', description: 'Высокая кухня, авторское меню и сезонные продукты.', category: 'Рестораны', icon: '🍽️', popular: true },
  { id: 4, title: 'Martinez Bar', description: 'Коктейли, живая музыка и вечерняя атмосфера Ривьеры.', category: 'Рестораны', icon: '🍸' },
  { id: 5, title: 'Завтрак с видом на море', description: 'Шведский стол и à la carte на террасе.', category: 'Рестораны', icon: '🥐' },
  { id: 6, title: 'Частный пляж', description: 'Шезлонги, cabana-зоны и персональное обслуживание.', category: 'Отдых', icon: '🏖️', popular: true },
  { id: 7, title: 'Бассейн с подогревом', description: 'Открытый бассейн с lounge-зоной.', category: 'Отдых', icon: '🏊' },
  { id: 8, title: 'Yacht Experience', description: 'Прогулки на яхте по Лазурному Берегу.', category: 'Отдых', icon: '🛥️' },
  { id: 9, title: 'SPA by Carita', description: 'Массажи, уходовые ритуалы и wellness-программы.', category: 'Wellness', icon: '💆', popular: true },
  { id: 10, title: 'Фитнес-зал 24/7', description: 'Современные тренажеры и персональные тренировки.', category: 'Wellness', icon: '🏋️' },
  { id: 11, title: 'Трансфер аэропорт-отель', description: 'Премиальный трансфер на автомобиле бизнес-класса.', category: 'Сервис', icon: '🚘' },
  { id: 12, title: 'Консьерж 24/7', description: 'Бронирования, маршруты, билеты и персональные запросы.', category: 'Сервис', icon: '🎩' },
  { id: 13, title: 'Бизнес-мероприятия', description: 'Конференц-залы, оборудование и полный event-сервис.', category: 'События', icon: '🎤' },
  { id: 14, title: 'Свадьбы и торжества', description: 'Организация церемоний и банкетов “под ключ”.', category: 'События', icon: '💍' },
  { id: 15, title: 'Kids Club', description: 'Детские активности и безопасная игровая зона.', category: 'Семья', icon: '🧸' },
  { id: 16, title: 'Pet Friendly', description: 'Комфортное размещение для гостей с питомцами.', category: 'Семья', icon: '🐾' }
]

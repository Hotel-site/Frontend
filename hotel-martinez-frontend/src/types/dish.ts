export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Drinks' | 'Dessert'

export interface Dish {
  id: number
  dayOfWeek: DayOfWeek
  meal: MealType
  name: string
  description?: string
  price: number
  isActive: boolean
}

export const mealTypeLabels: Record<MealType, string> = {
  Breakfast: 'Завтрак',
  Lunch: 'Обед',
  Dinner: 'Ужин',
  Drinks: 'Напитки',
  Dessert: 'Десерты',
}

export const dayOfWeekLabels: Record<DayOfWeek, string> = {
  Monday: 'Понедельник',
  Tuesday: 'Вторник',
  Wednesday: 'Среда',
  Thursday: 'Четверг',
  Friday: 'Пятница',
  Saturday: 'Суббота',
  Sunday: 'Воскресенье',
}

export const dayOfWeekKeys: Record<string, DayOfWeek> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

// Маппинг для числовых enum'ов из backend
export const mealNumToString: Record<number, MealType> = {
  1: 'Breakfast',
  2: 'Lunch',
  3: 'Dinner',
  4: 'Drinks',
  5: 'Dessert',
}

export const dayNumToString: Record<number, DayOfWeek> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

export const convertMealType = (meal: MealType | number): MealType => {
  if (typeof meal === 'string') return meal
  return mealNumToString[meal] || 'Breakfast'
}

export const convertDayOfWeek = (day: DayOfWeek | number): DayOfWeek => {
  if (typeof day === 'string') return day
  return dayNumToString[day] || 'Monday'
}

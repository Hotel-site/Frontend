import apiClient from './apiClient'
import type { Dish, DayOfWeek, MealType } from '../types/dish'
import { convertDayOfWeek, convertMealType } from '../types/dish'

// DTO coming from backend - может быть число или строка
export type DishDto = {
  id: number
  dayOfWeek: DayOfWeek | number
  meal: MealType | number
  name: string
  description?: string | null
  price: number
  isActive: boolean
}

const toDish = (dto: DishDto): Dish => {
  return {
    id: dto.id,
    dayOfWeek: convertDayOfWeek(dto.dayOfWeek),
    meal: convertMealType(dto.meal),
    name: dto.name,
    description: dto.description || undefined,
    price: dto.price,
    isActive: dto.isActive,
  }
}

export const dishApi = {
  getAll: async (): Promise<Dish[]> => {
    const response = await apiClient.get<DishDto[]>('/restaurant/all')
    return response.data.filter(d => d.isActive).map(toDish)
  },

  getByDay: async (dayOfWeek: DayOfWeek): Promise<Dish[]> => {
    const response = await apiClient.get<DishDto[]>(`/restaurant/by-day/${dayOfWeek}`)
    return response.data.filter(d => d.isActive).map(toDish)
  },

  getByDayAndMeal: async (dayOfWeek: DayOfWeek, meal: MealType): Promise<Dish[]> => {
    const response = await apiClient.get<DishDto[]>(`/restaurant/by-day/${dayOfWeek}/meal/${meal}`)
    return response.data.filter(d => d.isActive).map(toDish)
  },
}

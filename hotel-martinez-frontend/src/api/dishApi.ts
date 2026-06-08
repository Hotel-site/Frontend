import apiClient from './apiClient'
import type { Dish, DayOfWeek, MealType } from '../types/dish'
import { convertDayOfWeek, convertMealType } from '../types/dish'

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

type CreateDishPayload = {
  dayOfWeek: number
  meal: number
  name: string
  description?: string | null
  price: number
  isActive: boolean
}

type UpdateDishPayload = {
  id: number
  dayOfWeek: number
  meal: number
  name: string
  description?: string | null
  price: number
  isActive: boolean
}

const mealStringToNum: Record<string, number> = {
  'Breakfast': 1,
  'Lunch': 2,
  'Dinner': 3,
  'Drinks': 4,
  'Dessert': 5,
}

const dayStringToNum: Record<string, number> = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 7,
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

  create: async (dish: Dish): Promise<void> => {
    const payload: CreateDishPayload = {
      dayOfWeek: dayStringToNum[dish.dayOfWeek] || 1,
      meal: mealStringToNum[dish.meal] || 1,
      name: dish.name,
      description: dish.description || null,
      price: dish.price,
      isActive: true,
    }
    await apiClient.post('/restaurant', payload)
  },

  update: async (dish: Dish): Promise<void> => {
    const payload: UpdateDishPayload = {
      id: dish.id,
      dayOfWeek: dayStringToNum[dish.dayOfWeek] || 1,
      meal: mealStringToNum[dish.meal] || 1,
      name: dish.name,
      description: dish.description || null,
      price: dish.price,
      isActive: dish.isActive,
    }
    await apiClient.put(`/restaurant/${dish.id}`, payload)
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/restaurant/${id}`)
  },
}
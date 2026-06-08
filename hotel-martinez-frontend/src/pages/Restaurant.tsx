import { useState, useEffect, useCallback, useMemo } from 'react'
import '../styles/restaurant.css'
import { dishApi } from '../api'
import LoadingState from '../components/LoadingState/LoadingState'
import ErrorState from '../components/ErrorState/ErrorState'
import EmptyState from '../components/EmptyState/EmptyState'
import type { Dish, DayOfWeek, MealType } from '../types/dish'
import { dayOfWeekLabels, dayOfWeekKeys, mealTypeLabels } from '../types/dish'

const DAYS_OF_WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const MEAL_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Drinks']

export default function Restaurant() {
  const [activeDay, setActiveDay] = useState<string>('mon')
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDishes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await dishApi.getAll()
      setDishes(data)
    } catch (err) {
      console.error('Failed to load dishes:', err)
      setError('Не удалось загрузить меню')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {

    loadDishes()
  }, [loadDishes])

  const currentDayOfWeek = useMemo(() => {
    return dayOfWeekKeys[activeDay] as DayOfWeek
  }, [activeDay])

  const dayDishes = useMemo(() => {
    return dishes.filter(d => d.dayOfWeek === currentDayOfWeek)
  }, [dishes, currentDayOfWeek])

  const groupedByMeal = useMemo(() => {
    const grouped = new Map<MealType, Dish[]>()
    
    MEAL_ORDER.forEach(meal => {
      grouped.set(meal, [])
    })

    dayDishes.forEach(dish => {
      const mealDishes = grouped.get(dish.meal) || []
      grouped.set(dish.meal, mealDishes)
      mealDishes.push(dish)
    })

    return grouped
  }, [dayDishes])

  return (
    <div className="restaurant-page container">
      <header className="restaurant-hero">
        <h1>Ресторан Hotel Martinez</h1>
        <p>Меню меняется каждый день. Открыто с 7:00 до 23:30.</p>
      </header>

      <div className="day-tabs">
        {DAYS_OF_WEEK.map((dayKey) => (
          <button
            key={dayKey}
            className={`day-tab${activeDay === dayKey ? ' day-tab--active' : ''}`}
            onClick={() => setActiveDay(dayKey)}
          >
            {dayOfWeekLabels[dayOfWeekKeys[dayKey]]}
          </button>
        ))}
      </div>


      {isLoading && <LoadingState />}
      {error && (
        <ErrorState
          emoji="(>_<)"
          imageUrl="/cry.gif"
          title="Ошибка загрузки меню"
          message={error}
          onRetry={loadDishes}
        />
      )}

      {!isLoading && !error && dishes.length === 0 && (
        <EmptyState
          emoji="🍽️"
          title="Меню временно недоступно"
          hint="В данный момент нет блюд для отображения. Пожалуйста, попробуйте позже."
          actionText="Обновить"
          onAction={loadDishes}
        />
      )}

      {!isLoading && !error && dishes.length > 0 && (
        <section className="menu">
          {MEAL_ORDER.map((meal) => {
            const mealDishes = groupedByMeal.get(meal) || []
            if (mealDishes.length === 0) return null

            return (
              <div className="menu-section" key={meal}>
                <h2>{mealTypeLabels[meal]}</h2>
                <ul>
                  {mealDishes.map((dish) => (
                    <li className="menu-item" key={dish.id}>
                      <div>
                        <div className="menu-item__name">{dish.name}</div>
                        {dish.description && <div className="menu-item__desc">{dish.description}</div>}
                      </div>
                      <div className="menu-item__price">€{dish.price.toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}

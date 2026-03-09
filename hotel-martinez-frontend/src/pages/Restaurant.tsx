import { useState } from 'react'
import '../styles/restaurant.css'
import { DAYS } from '../data/menus'
import { DRINKS } from '../data/drinks'


export default function Restaurant() {
  const [activeDay, setActiveDay] = useState<string>('mon')
  const dayMenu = DAYS.find((d) => d.day === activeDay)!
  const dayDrinks = DRINKS.find((d) => d.day === activeDay)?.items ?? []

  return (
    <div className="restaurant-page container">
      <header className="restaurant-hero">
        <h1>Ресторан Hotel Martinez</h1>
        <p>Меню меняется каждый день. Открыто с 7:00 до 23:30.</p>
      </header>

      <div className="day-tabs">
        {DAYS.map((d) => (
          <button
            key={d.day}
            className={`day-tab${activeDay === d.day ? ' day-tab--active' : ''}`}
            onClick={() => setActiveDay(d.day)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <section className="menu">
        {dayMenu.sections.map((section) => (
          <div className="menu-section" key={section.category}>
            <h2>{section.category}</h2>
            <ul>
              {section.items.map((it) => (
                <li className="menu-item" key={it.id}>
                  <div>
                    <div className="menu-item__name">{it.name}</div>
                    {it.description && <div className="menu-item__desc">{it.description}</div>}
                  </div>
                  <div className="menu-item__price">{it.price}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="menu-section">
          <h2>Напитки</h2>
          <ul>
            {dayDrinks.map((drink) => (
              <li className="menu-item" key={drink.id}>
                <div>
                  <div className="menu-item__name">{drink.name}</div>
                </div>
                <div className="menu-item__price">{drink.price}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

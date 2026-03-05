import { useMemo, useState } from 'react'
import ServiceCard from '../components/ServiceCard'
import { services } from '../data/services'
import '../styles/services.css'

export default function Services() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')

  const categories = useMemo(
    () => ['Все', ...Array.from(new Set(services.map((s) => s.category)))],
    []
  )

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const byCategory = category === 'Все' || s.category === category
      const byQuery = s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
      return byCategory && byQuery
    })
  }, [query, category])

  return (
    <section className="services">
      <div className="container">
        <h1>Каталог услуг</h1>
        <p className="services__subtitle">Выберите услуги для идеального отдыха</p>

        <div className="services__controls">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск услуг..."
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="services__grid">
          {filtered.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      </div>
    </section>
  )
}
import { useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import '../styles/catalog.css'

type Props = {
  favorites: number[]
  onToggleFavorite: (id: number) => void
  onAddToCart: (id: number) => void
}

export default function Catalog({ favorites, onToggleFavorite, onAddToCart }: Props) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const [likes, setLikes] = useState<Record<number, number>>({})

  const categories = useMemo(
    () => ['Все', ...Array.from(new Set(products.map((p) => p.category)))],
    []
  )

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const byCategory = category === 'Все' || p.category === category
      const byQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      return byCategory && byQuery
    })
  }, [query, category])

  const handleLike = (id: number) => {
    setLikes((prev) => ({
      ...prev,
      [id]: prev[id] ? 0 : 1,
    }))
  }

  return (
    <section className="catalog">
      <div className="container">
        <h1>Каталог услуг и предложений</h1>

        <input
          className="search"
          placeholder="Поиск по каталогу..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="filters">
          {categories.map((c) => (
            <button
              key={c}
              className={`filter-btn ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="counter">
          Найдено: {filtered.length} | В избранном: {favorites.length}
        </p>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">😢</p>
            <p className="empty-title">Ничего не найдено</p>
            <p className="empty-hint">Попробуйте изменить фильтр или поисковый запрос</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isFavorite={favorites.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
                likes={likes[p.id] || 0}
                onLike={() => handleLike(p.id)}
                onAddToCart={() => onAddToCart(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

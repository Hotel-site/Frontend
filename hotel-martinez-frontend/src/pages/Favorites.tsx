import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import '../styles/catalog.css'

type Props = {
  favorites: number[]
  onToggleFavorite: (id: number) => void
}

export default function Favorites({ favorites, onToggleFavorite }: Props) {
  const favProducts = products.filter((p) => favorites.includes(p.id))

  return (
    <section className="catalog">
      <div className="container">
        <h1>Избранное</h1>
        <p className="counter">Товаров в избранном: {favProducts.length}</p>

        {favProducts.length === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">💔</p>
            <p className="empty-title">Избранное пока пусто</p>
            <p className="empty-hint">Добавьте понравившиеся товары из каталога</p>
            <div className="filters" style={{ marginTop: '16px' }}>
              <Link to="/catalog" className="filter-btn active" style={{ textDecoration: 'none' }}>
                Перейти в каталог
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid">
            {favProducts.map((p) => (
              <ProductCard key={p.id} product={p} isFavorite={true} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

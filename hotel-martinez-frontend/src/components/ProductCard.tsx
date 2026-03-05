import type { Product } from '../types/product'
import '../styles/product-card.css'

type Props = {
  product: Product
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
  likes?: number
  onLike?: (id: number) => void
  onAddToCart?: (id: number) => void
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  likes = 0,
  onLike,
  onAddToCart,
}: Props) {
  return (
    <article className="card">
      <img src={product.image} alt={product.title} className="card__img" />
      <div className="card__body">
        <div className="card__cat">{product.category}</div>
        <h3 className="card__title">{product.title}</h3>
        <p className="card__price">
          {product.price.toLocaleString('de-DE')} {product.unit ?? '€'}
        </p>

        <div className="card__stats">
          <button
            className="like-stat"
            onClick={() => onLike?.(product.id)}
            title="Лайки"
          >
            <span className="like-icon">👍</span>
            <span className="like-count">{likes}</span>
          </button>
          <span className="rating">★★★★★ (15)</span>
        </div>

        <div className="card__actions">
          <button
            className={`like-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(product.id)}
            title="Добавить в избранное"
          >
            <span className="like-icon">{isFavorite ? '♥' : '♡'}</span>
            <span>{isFavorite ? 'В избранном' : 'Like'}</span>
          </button>
          <button
            className="cart-btn"
            onClick={() => onAddToCart?.(product.id)}
            title="Добавить в корзину"
          >
            <span>🛒</span>
            <span>В корзину</span>
          </button>
        </div>
      </div>
    </article>
  )
}

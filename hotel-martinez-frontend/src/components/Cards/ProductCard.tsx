import { useState } from 'react'
import type { Product } from '../../types/product'
import '../../styles/product-card.css'

type Props = {
  product: Product
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
  likes?: number
  onLike?: (id: number) => void
  onAddToCart?: (id: number) => void
  onViewDetails?: (product: Product) => void
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  likes = 0,
  onLike,
  onAddToCart,
  onViewDetails,
}: Props) {
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  const handleAddToCart = () => {
    setIsAddedToCart(true)
    onAddToCart?.(product.id)
    setTimeout(() => setIsAddedToCart(false), 600)
  }

  return (
    <article className="card" onClick={() => onViewDetails?.(product)} style={{ cursor: 'pointer' }}>
      <img src={product.image} alt={product.title} className="card__img" />
      <div className="card__body">
        <div className="card__cat">{product.category}</div>
        <h3 className="card__title">{product.title}</h3>
        <p className="card__price">
          {product.price.toLocaleString('de-DE')} €
        </p>

        <div className="card__stats">
          <button
            className="like-stat"
            onClick={(e) => {
              e.stopPropagation()
              onLike?.(product.id)
            }}
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
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(product.id)
            }}
            title="Добавить в избранное"
          >
            <span className="like-icon">{isFavorite ? '♥' : '♡'}</span>
            <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
          </button>
          <button
            className={`cart-btn ${isAddedToCart ? 'added' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleAddToCart()
            }}
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

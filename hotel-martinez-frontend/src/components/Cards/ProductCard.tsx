import { useState } from 'react'
import type { Product } from '../../types/product'
import '../../styles/product-card.css'

type Props = {
  product: Product
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
  onAddToCart?: (id: number) => void
  onViewDetails?: (product: Product) => void
  onRequestBooking?: (product: Product) => void
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onViewDetails,
  onRequestBooking,
}: Props) {
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  const handleCartClick = () => {
    if (product.requiresBooking) {
      onRequestBooking?.(product)
    } else {
      setIsAddedToCart(true)
      onAddToCart?.(product.id)
      setTimeout(() => setIsAddedToCart(false), 600)
    }
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

        <div className="card__actions">
          <button
            className={`like-btn ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(product.id)
            }}
            title="Добавить в избранное">
            <span className="like-icon">{isFavorite ? '♥' : '♡'}</span>
            <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
          </button>
          <button
            className={`cart-btn ${isAddedToCart ? 'added' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleCartClick()
            }}
            title={product.requiresBooking ? 'Забронировать' : 'Добавить в корзину'}>
            <span>{product.requiresBooking ? '📅' : '🛒'}</span>
            <span>{product.requiresBooking ? 'Забронировать' : 'В корзину'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
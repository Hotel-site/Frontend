import clsx from 'clsx'
import { useState } from 'react'
import type { Attraction, ViewMode } from '../../types/local'
import styles from './AttractionCard.module.css'
import { translate } from '../../utils/i18n'

type AttractionCardProps = {
  attraction: Attraction
  isFavorite: boolean
  viewMode: ViewMode
  onToggleFavorite: (id: string) => void
  onAddToCart: () => void
  onOpenDetails: (id: string) => void
  cardRef?: (node: HTMLLIElement | null) => void
}

export default function AttractionCard({
  attraction,
  isFavorite,
  viewMode,
  onToggleFavorite,
  onAddToCart,
  onOpenDetails,
  cardRef,
}: AttractionCardProps) {
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  const handleAddToCart = () => {
    setIsAddedToCart(true)
    onAddToCart()
    setTimeout(() => setIsAddedToCart(false), 600)
  }

  return (
    <li 
      ref={cardRef} 
      id={`attraction-card-${attraction.id}`} 
      className={clsx(styles.card, styles[viewMode])}
      onClick={() => onOpenDetails(attraction.id)}
    >
      <img loading="lazy" src={attraction.images[0]} alt={attraction.name} className={styles.cover} />
      <div className={styles.content}>
        <p className={styles.meta}>
          <span>{attraction.distanceKm} км</span>
          <span>Рейтинг: {attraction.rating.toFixed(1)}</span>
        </p>
        
        <div className={styles.textContent}>
          <h3>{attraction.name}</h3>
        </div>

        <div className={styles.priceTag}>
          {attraction.price === 0 ? 'Бесплатно' : `€${attraction.price}`}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? translate('removeFromFavorites') : translate('addToFavorites')}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(attraction.id)
            }}
          >
            <span>{isFavorite ? '♥' : '♡'}</span>
            <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
          </button>
          <button
            type="button"
            className={clsx(styles.cartBtn, { [styles.added]: isAddedToCart })}
            aria-label="Добавить в корзину"
            onClick={(e) => {
              e.stopPropagation()
              handleAddToCart()
            }}
          >
            <span>🛒</span>
            <span>В корзину</span>
          </button>
        </div>
      </div>
    </li>
  )
}

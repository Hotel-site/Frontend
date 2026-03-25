import clsx from 'clsx'
import type { Attraction, ViewMode } from '../../types/local'
import styles from './AttractionCard.module.css'
import { translate } from '../../utils/i18n'

type AttractionCardProps = {
  attraction: Attraction
  isFavorite: boolean
  viewMode: ViewMode
  onToggleFavorite: (id: string) => void
  onOpenDetails: (id: string) => void
  cardRef?: (node: HTMLLIElement | null) => void
}

export default function AttractionCard({
  attraction,
  isFavorite,
  viewMode,
  onToggleFavorite,
  onOpenDetails,
  cardRef,
}: AttractionCardProps) {
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
        <h3>{attraction.name}</h3>
        <p className={styles.description}>{attraction.shortDescription}</p>
        <p className={styles.tags}>{attraction.tags.join(' · ')}</p>

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
        </div>
      </div>
    </li>
  )
}

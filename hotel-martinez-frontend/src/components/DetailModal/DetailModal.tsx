import { useEffect, useState } from 'react'
import { submitBookingRequest } from '../../data/attractions'
import type { Attraction, Category } from '../../types/local'
import styles from './DetailModal.module.css'
import { translate } from '../../utils/i18n'

const CATEGORY_LABELS: Record<Category, string> = {
  culture: 'Культура',
  nature: 'Природа',
  food: 'Еда',
  shopping: 'Покупки',
  family: 'Семья',
  nightlife: 'Ночная жизнь',
}

type DetailModalProps = {
  attraction: Attraction | null
  onClose: () => void
}

export default function DetailModal({ attraction, onClose }: DetailModalProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [bookingState, setBookingState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [bookingMessage, setBookingMessage] = useState('')

  useEffect(() => {
    setActiveImage(0)
    setBookingState('idle')
    setBookingMessage('')
  }, [attraction?.id])

  useEffect(() => {
    if (!attraction) {
      return
    }

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft' && attraction.images.length > 1) {
        setActiveImage((prev) => (prev > 0 ? prev - 1 : attraction.images.length - 1))
      } else if (event.key === 'ArrowRight' && attraction.images.length > 1) {
        setActiveImage((prev) => (prev < attraction.images.length - 1 ? prev + 1 : 0))
      }
    }

    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = previousBodyOverflow
    }
  }, [attraction, onClose])

  if (!attraction) {
    return null
  }

  const bookNow = async () => {
    setBookingState('loading')
    setBookingMessage('')

    try {
      await submitBookingRequest({
        attractionId: attraction.id,
        guestName: 'Guest',
        guestPhone: '+0 000 000 00 00',
      })

      setBookingState('success')
      setBookingMessage('')
    } catch {
      setBookingState('idle')
      setBookingMessage('Не удалось отправить заявку. Попробуйте еще раз.')
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <div className={styles.modal}>
        <button type="button" aria-label="Закрыть детальную информацию" className={styles.closeBtn} onClick={onClose}>
          x
        </button>

        <div className={styles.content}>
          <div className={styles.imageGallery}>
            <img loading="lazy" src={attraction.images[activeImage]} alt={attraction.name} className={styles.productImage} />
            {attraction.images.length > 1 && (
              <>
                <button
                  type="button"
                  className={styles.navButtonPrev}
                  onClick={() =>
                    setActiveImage((prev) => (prev > 0 ? prev - 1 : attraction.images.length - 1))
                  }
                  aria-label="Предыдущее фото"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className={styles.navButtonNext}
                  onClick={() =>
                    setActiveImage((prev) => (prev < attraction.images.length - 1 ? prev + 1 : 0))
                  }
                  aria-label="Следующее фото"
                >
                  ›
                </button>

                <div className={styles.imageIndicators}>
                  {attraction.images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`${styles.indicator} ${index === activeImage ? styles.indicatorActive : ''}`}
                      onClick={() => setActiveImage(index)}
                      aria-label={`Перейти на фото ${index + 1}`}
                      aria-current={index === activeImage}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.details}>
            <h2 id="detail-modal-title">{attraction.name}</h2>
            <p className={styles.category}>{CATEGORY_LABELS[attraction.category]}</p>
            <p className={styles.price}>
              Цена: {attraction.price.toLocaleString('de-DE')} €
            </p>

            <div className={styles.rating}>
              <span>★★★★★ ({attraction.rating.toFixed(1)} из 5)</span>
            </div>

            <div className={styles.description}>
              <h3>Описание</h3>
              <p className={styles.descriptionText}>{attraction.description}</p>
            </div>

            <div className={styles.productInfo}>
              <h3>Контакты партнера</h3>
              <div className={styles.contactsList}>
                {attraction.partnerContact.phone && (
                  <p className={styles.contactItem}>
                    <span className={styles.contactIcon}>📞</span>
                    <span className={styles.contactValue}>{attraction.partnerContact.phone}</span>
                  </p>
                )}
                {attraction.partnerContact.email && (
                  <p className={styles.contactItem}>
                    <span className={styles.contactIcon}>📧</span>
                    <span className={styles.contactValue}>{attraction.partnerContact.email}</span>
                  </p>
                )}
                {attraction.partnerContact.website && (
                  <p className={styles.contactItem}>
                    <span className={styles.contactIcon}>🌐</span>
                    <a
                      href={`https://${attraction.partnerContact.website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.websiteLink}
                    >
                      {attraction.partnerContact.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <button type="button" className={styles.bookBtn} onClick={() => void bookNow()} disabled={bookingState === 'loading'}>
              {bookingState === 'success' ? 'Заявка отправлена' : translate('bookNow')}
            </button>

            {bookingMessage && (
              <p className={styles.bookingMessage} role="status" aria-live="polite">
                {bookingMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

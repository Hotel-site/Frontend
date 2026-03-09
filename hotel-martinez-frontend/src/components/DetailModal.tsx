import { useEffect, useState } from 'react'
import { submitBookingRequest } from '../services/localApi'
import type { Attraction } from '../types/local'
import styles from './DetailModal.module.css'
import { translate } from '../utils/i18n'

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

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [attraction, onClose])

  if (!attraction) {
    return null
  }

  const bookNow = async () => {
    setBookingState('loading')
    setBookingMessage('')

    try {
      const response = await submitBookingRequest({
        attractionId: attraction.id,
        guestName: 'Guest',
        guestPhone: '+0 000 000 00 00',
      })

      setBookingState('success')
      setBookingMessage(`${response.message}. Endpoint: ${response.endpoint}`)
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

        <h2 id="detail-modal-title">{attraction.name}</h2>
        <p>{attraction.description}</p>

        <div className={styles.gallery}>
          <img loading="lazy" src={attraction.images[activeImage]} alt={attraction.name} className={styles.mainImage} />
          <div className={styles.thumbs}>
            {attraction.images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={index === activeImage ? styles.thumbActive : styles.thumb}
                onClick={() => setActiveImage(index)}
              >
                <img loading="lazy" src={image} alt={`${attraction.name} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <p>
          Контакты партнера: {attraction.partnerContact.phone} · {attraction.partnerContact.email}
        </p>

        <button type="button" className={styles.bookBtn} onClick={() => void bookNow()} disabled={bookingState === 'loading'}>
          {bookingState === 'success' ? 'Заявка отправлена' : translate('bookNow')}
        </button>

        {bookingMessage && (
          <p className={styles.bookingMessage} role="status" aria-live="polite">
            {bookingMessage}
          </p>
        )}

        {attraction.partnerContact.bookingUrl && (
          <a
            className={styles.partnerLink}
            href={attraction.partnerContact.bookingUrl}
            target="_blank"
            rel="noreferrer"
          >
            Перейти к партнеру для подтверждения
          </a>
        )}
      </div>
    </div>
  )
}

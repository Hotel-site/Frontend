import { useState, useEffect, useRef } from 'react'
import type { Room } from '../../types/room'
import './RoomDetailModal.css'

interface RoomDetailModalProps {
  room: Room
  onClose: () => void
}

export default function RoomDetailModal({ room, onClose }: RoomDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const amenitiesListRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
    }
  }, [onClose])

  useEffect(() => {
    const amenitiesList = amenitiesListRef.current
    if (!amenitiesList) return

    const syncAmenityHeights = () => {
      const items = Array.from(
        amenitiesList.querySelectorAll<HTMLElement>('.details-amenity-item')
      )

      if (!items.length) return

      items.forEach((item) => {
        item.style.minHeight = '0px'
      })

      const maxHeight = Math.max(
        ...items.map((item) => Math.ceil(item.getBoundingClientRect().height))
      )

      items.forEach((item) => {
        item.style.minHeight = `${maxHeight}px`
      })
    }

    const rafId = window.requestAnimationFrame(syncAmenityHeights)
    window.addEventListener('resize', syncAmenityHeights)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', syncAmenityHeights)
    }
  }, [room])

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? room.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => ((prev + 1) % room.images.length))
  }

  const handleImageDotClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="room-modal__overlay"
      onClick={handleOverlayClick}
      tabIndex={0}
      role="presentation"
    >
      <div className="room-modal__content" role="dialog" aria-modal="true">
        <button
          className="room-modal__close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Image Gallery */}
        <div className="room-modal__gallery">
          <div className="gallery-container">
            <img
              src={room.images[currentImageIndex]}
              alt={`${room.title} - фото ${currentImageIndex + 1}`}
              className="modal-gallery-image"
            />
            {room.images.length > 1 && (
              <>
                <button
                  className="gallery-nav gallery-nav--prev"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="gallery-nav gallery-nav--next"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="gallery-indicator">
                  {currentImageIndex + 1} / {room.images.length}
                </div>
                <div className="gallery-dots">
                  {room.images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`dot ${currentImageIndex === idx ? 'active' : ''}`}
                      onClick={() => handleImageDotClick(idx)}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Room Details */}
        <div className="room-modal__details">
          <div className="details-header">
            <div>
              <h2 className="details-title">{room.title}</h2>
            </div>
            <div className="details-price">
              <span className="price-value">{room.price}€</span>
              <span className="price-unit">/ ночь</span>
            </div>
          </div>

          <div className="details-section">
            <h3>Описание</h3>
            <p className="details-long-desc">{room.description}</p>
          </div>

          <div className="details-amenities">
            <h3>Удобства</h3>
            <ul ref={amenitiesListRef} className="details-amenities-list">
              {room.amenities.map((amenity, idx) => (
                <li key={idx} className="details-amenity-item">
                  <span className="amenity-check">✓</span>
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

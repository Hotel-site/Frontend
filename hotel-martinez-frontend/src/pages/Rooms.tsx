import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { roomApi } from '../api'
import RoomDetailModal from '../components/RoomDetailModal/RoomDetailModal'
import LoadingState from '../components/LoadingState/LoadingState'
import ErrorState from '../components/ErrorState/ErrorState'
import { useAuth } from '../context/AuthContext'
import type { Product } from '../types/product'
import type { BookingData } from '../types/cart'
import type { Room } from '../types/room'
import '../styles/rooms.css'
import '../styles/catalog.css'

type Props = {
  onAddBookingToCart?: (product: Product, bookingData: BookingData) => void
}

export default function Rooms({ onAddBookingToCart }: Props) {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<Room | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({})
  const [bookingRoom, setBookingRoom] = useState<any>(null)

  const loadRooms = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await roomApi.getAll()
      setRooms(data)
    } catch (err) {
      console.error('Failed to load rooms:', err)
      setError('Не удалось загрузить список номеров. Пожалуйста, попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  useEffect(() => {
    if (!selectedRoom) {
      setSelectedRoomDetails(null)
      return
    }

    const previewRoom = rooms.find((room) => room.id === selectedRoom) ?? null
    setSelectedRoomDetails(previewRoom)

    let cancelled = false

    roomApi
      .getById(selectedRoom)
      .then((data) => {
        if (!cancelled) {
          setSelectedRoomDetails(data)
        }
      })
      .catch((err) => {
        console.error('Failed to load room details:', err)
        if (!cancelled) {
          setSelectedRoomDetails(previewRoom)
        }
      })

    return () => {
      cancelled = true
    }
  }, [rooms, selectedRoom])

  // Открытие номера по ID из URL параметров
  useEffect(() => {
    const roomId = searchParams.get('roomId')
    if (roomId) {
      const room = rooms.find(r => r.id === parseInt(roomId))
      if (room) {
        setSelectedRoom(room.id)
      }
      // Удалить параметр из URL после открытия
      setSearchParams({})
    }
  }, [searchParams, setSearchParams, rooms])

  const handlePrevImage = (roomId: number, totalImages: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) === 0 ? totalImages - 1 : (prev[roomId] || 0) - 1,
    }))
  }

  const handleNextImage = (roomId: number, totalImages: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) + 1) % totalImages,
    }))
  }

  return (
    <section className="rooms">
      <div className="container">
        <h1>Номера и Тарифы</h1>
        <p className="rooms__subtitle">
          Выберите идеальное жилье для вашего отпуска в Канне
        </p>

        {isLoading && <LoadingState title="Загружаем номера" message="Ищем лучшие варианты размещения для вас..." />}

        {!isLoading && error && (
          <ErrorState 
            emoji="(>_<)"
            imageUrl="/cry.gif"
            title="Ошибка загрузки номеров" 
            message={error} 
            onRetry={loadRooms} 
          />
        )}

        {!isLoading && !error && (
        <div className="rooms__grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card" onClick={() => setSelectedRoom(room.id)}>
              <div className="room-card__gallery">
                <div className="gallery-container">
                  <img
                    src={room.images[currentImageIndex[room.id] || 0]}
                    alt={room.title}
                    className="gallery-image"
                  />
                  {room.images.length > 1 && (
                    <>
                      <button
                        className="gallery-btn gallery-btn--prev"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePrevImage(room.id, room.images.length)
                        }}
                      >
                        ‹
                      </button>
                      <button
                        className="gallery-btn gallery-btn--next"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNextImage(room.id, room.images.length)
                        }}
                      >
                        ›
                      </button>
                      <div className="gallery-dots">
                        {room.images.map((_, idx) => (
                          <span
                            key={idx}
                            className={`dot ${(currentImageIndex[room.id] || 0) === idx ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex((prev) => ({ ...prev, [room.id]: idx }))
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="room-card__content">
                <div className="room-header">
                  <div>
                    <h2 className="room-title">{room.title}</h2>
                  </div>
                  <div className="room-price">
                    <span className="price-value">{room.price}€</span>
                    <span className="price-unit">/ ночь</span>
                  </div>
                </div>

                <button 
                  className="room-booking-btn"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setBookingRoom(room)
                  }}>
                  📞 Забронировать номер
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        <div className="booking-section">
          <h2>Готовы к бронированию?</h2>
          <p>Свяжитесь с нами для получения лучших предложений и условий</p>
          <div className="booking-buttons">
            <button className="btn btn-primary">📞 Позвонить</button>
            <button className="btn btn-secondary">✉️ Email</button>
          </div>
        </div>
      </div>

      {selectedRoom && selectedRoomDetails && (
        <RoomDetailModal
          room={selectedRoomDetails}
          onClose={() => setSelectedRoom(null)}
        />
      )}

      {bookingRoom && (
        <div className="booking-modal" role="dialog" aria-modal="true">
          <div className="booking-modal__content" onClick={(e) => e.stopPropagation()}>
            <button
              className="booking-modal__close"
              onClick={() => setBookingRoom(null)}
            >
              ✕
            </button>

            <h2>Бронирование: {bookingRoom.title}</h2>
            <p className="booking-modal__price">
              {bookingRoom.price.toLocaleString('de-DE')} €
            </p>

            <div className="booking-modal__user-info">
              <p>
                <strong>От:</strong> {user?.username} ({user?.email})
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget as HTMLFormElement)
                const dateTime = formData.get('dateTime') as string
                const notes = formData.get('notes') as string

                const roomAsProduct: Product = {
                  id: bookingRoom.id,
                  title: bookingRoom.title,
                  description: bookingRoom.description,
                  category: 'Номера',
                  price: bookingRoom.price,
                  image: bookingRoom.images[0],
                  requiresBooking: true,
                }

                try {
                  await onAddBookingToCart?.(roomAsProduct, {
                    dateTime,
                    notes,
                  })

                  alert(`Спасибо за бронирование ${bookingRoom.title}!\nВаша бронь добавлена в корзину.`)
                  setBookingRoom(null)
                } catch (error) {
                  console.error('Failed to add room booking to cart:', error)
                  alert('Не удалось добавить бронирование в корзину')
                }
              }}
              className="booking-form"
            >
              <label>
                Дата и время
                <input type="datetime-local" name="dateTime" required />
              </label>

              <label>
                Дополнительные пожелания
                <textarea name="notes" placeholder="Расскажите о ваших пожеланиях..." rows={3}></textarea>
              </label>

              <button type="submit" className="booking-form__submit">
                Забронировать
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
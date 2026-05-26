import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { roomApi } from '../api'
import { rooms as mockRooms } from '../data/rooms'
import RoomDetailModal from '../components/RoomDetailModal/RoomDetailModal'
import { useAuth } from '../context/AuthContext'
import type { Product } from '../types/product'
import type { BookingData } from '../types/cart'
import type { Room } from '../api'
import '../styles/rooms.css'
import '../styles/catalog.css'

type Props = {
  onAddBookingToCart?: (product: Product, bookingData: BookingData) => void
}

export default function Rooms({ onAddBookingToCart }: Props) {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>(mockRooms as any)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({})
  const [bookingRoom, setBookingRoom] = useState<any>(null)

  // Load rooms from API
  useEffect(() => {
    const loadRooms = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await roomApi.getAll()
        setRooms(data)
      } catch (err) {
        console.error('Failed to load rooms:', err)
        setError('Не удалось загрузить номера')
        setRooms(mockRooms as any)
      } finally {
        setIsLoading(false)
      }
    }

    loadRooms()
  }, [])

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
                    <p className="room-description">{room.description}</p>
                  </div>
                  <div className="room-price">
                    <span className="price-value">{room.price}€</span>
                    <span className="price-unit">/ ночь</span>
                  </div>
                </div>

                <div className="room-specs">
                  <div className="spec">
                    <span className="spec-icon">👥</span>
                    <span>Гостей: {room.capacity}</span>
                  </div>
                  <div className="spec">
                    <span className="spec-icon">📏</span>
                    <span>{room.size} м²</span>
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

        <div className="booking-section">
          <h2>Готовы к бронированию?</h2>
          <p>Свяжитесь с нами для получения лучших предложений и условий</p>
          <div className="booking-buttons">
            <button className="btn btn-primary">📞 Позвонить</button>
            <button className="btn btn-secondary">✉️ Email</button>
          </div>
        </div>
      </div>

      {selectedRoom && (
        <RoomDetailModal
          room={rooms.find((r) => r.id === selectedRoom)!}
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
                <strong>От:</strong> {user?.name} ({user?.email})
              </p>
            </div>

            <form
              onSubmit={(e) => {
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

                onAddBookingToCart?.(roomAsProduct, {
                  dateTime,
                  notes,
                })

                alert(`Спасибо за бронирование ${bookingRoom.title}!\nВаша бронь добавлена в корзину.`)
                setBookingRoom(null)
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
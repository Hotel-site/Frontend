import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { rooms } from '../data/rooms'
import RoomDetailModal from '../components/RoomDetailModal/RoomDetailModal'
import '../styles/rooms.css'

export default function Rooms() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({})

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
  }, [searchParams, setSearchParams])

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
            <div key={room.id} className="room-card">
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
                        onClick={() => handlePrevImage(room.id, room.images.length)}
                      >
                        ‹
                      </button>
                      <button
                        className="gallery-btn gallery-btn--next"
                        onClick={() => handleNextImage(room.id, room.images.length)}
                      >
                        ›
                      </button>
                      <div className="gallery-dots">
                        {room.images.map((_, idx) => (
                          <span
                            key={idx}
                            className={`dot ${(currentImageIndex[room.id] || 0) === idx ? 'active' : ''}`}
                            onClick={() =>
                              setCurrentImageIndex((prev) => ({ ...prev, [room.id]: idx }))
                            }
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
                  className="room-btn"
                  onClick={() => setSelectedRoom(room.id)}>
                  Подробнее
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
    </section>
  )
}
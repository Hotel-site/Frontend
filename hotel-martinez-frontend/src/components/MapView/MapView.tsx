import { useMemo, useState } from 'react'
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import type { Attraction } from '../../types/local'
import styles from './MapView.module.css'

type MapViewProps = {
  attractions: Attraction[]
  selectedId: string | null
  onMarkerSelect: (id: string) => void
}

const containerStyle = {
  width: '100%',
  height: '100%',
}

export default function MapView({ attractions, selectedId, onMarkerSelect }: MapViewProps) {
  const [infoId, setInfoId] = useState<string | null>(null)
  const center = useMemo(() => attractions[0]?.coords ?? { lat: 43.5513, lng: 7.0174 }, [attractions])

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  })

  if (loadError) {
    return <div className={styles.fallback}>Не удалось загрузить Google Maps API</div>
  }

  if (!isLoaded) {
    return <div className={styles.fallback}>Загрузка карты...</div>
  }

  return (
    <div className={styles.mapContainer}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13} options={{ disableDefaultUI: false }}>
        {attractions.map((attraction) => (
          <MarkerF
            key={attraction.id}
            position={attraction.coords}
            onClick={() => {
              setInfoId(attraction.id)
              onMarkerSelect(attraction.id)
            }}
            zIndex={selectedId === attraction.id ? 10 : 1}
          />
        ))}

        {infoId && (
          <InfoWindowF
            position={attractions.find((item) => item.id === infoId)?.coords}
            onCloseClick={() => setInfoId(null)}
          >
            <div className={styles.infoWindow}>
              {(() => {
                const attraction = attractions.find((item) => item.id === infoId)
                if (!attraction) return null
                return (
                  <>
                    {attraction.images[0] && (
                      <img src={attraction.images[0]} alt={attraction.name} className={styles.infoImage} />
                    )}
                    <button
                      className={styles.closeButton}
                      onClick={() => setInfoId(null)}
                      aria-label="Закрыть"
                      type="button"
                    >
                      ✕
                    </button>
                    <div className={styles.infoContent}>
                      <h3 className={styles.infoTitle}>{attraction.name}</h3>
                      <div className={styles.infoMeta}>
                        <span className={styles.infoRating}>⭐ {attraction.rating}</span>
                        <span className={styles.infoDistance}>{attraction.distanceKm} км</span>
                        {attraction.price > 0 && (
                          <span className={styles.infoPrice}>{attraction.price}€</span>
                        )}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  )
}

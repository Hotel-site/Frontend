import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/Cards/ProductCard'
import ErrorState from '../components/ErrorState/ErrorState'
import LoadingState from '../components/LoadingState/LoadingState'
import { useAuth } from '../context/AuthContext'
import { attractionApi, favoriteApi, productApi } from '../api'
import type { Favorite } from '../api'
import type { AttractionBackendDto } from '../api/attractionApi'
import type { Attraction } from '../types/local'
import type { Product } from '../types/product'
import '../styles/catalog.css'

type Props = {
  favorites: number[]
  onToggleFavorite: (id: number) => void
}

export default function Favorites({ favorites, onToggleFavorite }: Props) {
  const { user } = useAuth()
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [localItems, setLocalItems] = useState<Attraction[]>([])
  const [localFavorites, setLocalFavorites] = useState<Array<{ favorite: Favorite; item: Attraction }>>([])
  const [isLoadingLocal, setIsLoadingLocal] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const localCount = localItems.length
  const totalCount = favoriteProducts.length + localCount

  const mapApiAttractionToUi = (item: AttractionBackendDto): Attraction => ({
    id: item.id.toString(),
    name: item.name,
    shortDescription: item.shortDescription ?? '',
    description: item.description ?? '',
    category: 'culture',
    address: item.address,
    coords: {
      lat: 0,
      lng: 0,
    },
    distanceKm: item.distance,
    price: item.price,
    openingHours: {
      monday: '00:00-23:59',
      tuesday: '00:00-23:59',
      wednesday: '00:00-23:59',
      thursday: '00:00-23:59',
      friday: '00:00-23:59',
      saturday: '00:00-23:59',
      sunday: '00:00-23:59',
    },
    rating: 0,
    images: item.images.map((image) => image.url).filter((url): url is string => Boolean(url)),
    partnerContact: {
      phone: item.contacts.phone,
      email: item.contacts.email,
      bookingUrl: item.contacts.bookingUrl,
    },
  })

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoadingLocal(true)
      setLoadError(null)

      try {
        const userId = user?.id ? Number(user.id) : NaN

        const favoriteProductIds = Array.from(new Set(favorites))
        const productFavoritesPromise = Promise.all(
          favoriteProductIds.map(async (productId) => {
            try {
              return await productApi.getById(productId)
            } catch (error) {
              console.warn(`Failed to load favorite product ${productId}:`, error)
              return null
            }
          })
        )

        const attractionFavoritesPromise = Number.isFinite(userId)
          ? favoriteApi.getUserFavorites(userId).then(async (apiFavorites) => {
              const attractionFavs = apiFavorites.filter((fav) => fav.entityType === 2)
              const mappedFavorites = await Promise.all(
                attractionFavs.map(async (fav) => {
                  try {
                    const item = await attractionApi.getById(fav.entityId)
                    if (!item) return null
                    return { favorite: fav, item: mapApiAttractionToUi(item) }
                  } catch (error) {
                    console.warn(`Failed to load favorite attraction ${fav.entityId}:`, error)
                    return null
                  }
                })
              )
              return mappedFavorites.filter(
                (entry): entry is { favorite: Favorite; item: Attraction } => entry !== null
              )
            })
          : Promise.resolve([] as Array<{ favorite: Favorite; item: Attraction }>)

        const [productResults, attractionResults] = await Promise.all([
          productFavoritesPromise,
          attractionFavoritesPromise,
        ])

        setFavoriteProducts(productResults.filter((item): item is Product => item !== null))
        setLocalFavorites(attractionResults)
        setLocalItems(attractionResults.map((entry) => entry.item))
      } catch (err) {
        console.error('Failed to load favorites:', err)
        setLoadError('Не удалось загрузить избранное. Попробуйте позже.')
      } finally {
        setIsLoadingLocal(false)
      }
    }

    loadFavorites()
  }, [favorites, user?.id])

  const localItemIdSet = useMemo(() => new Set(localItems.map((item) => item.id)), [localItems])

  const removeLocalFavorite = async (id: string) => {
    const pair = localFavorites.find((entry) => entry.item.id === id)
    if (pair) {
      await favoriteApi.removeFavorite(pair.favorite.id)
      setLocalFavorites((prev) => prev.filter((entry) => entry.item.id !== id))
    }
    window.dispatchEvent(new Event('local-favorites-updated'))
    setLocalItems((prev) => prev.filter((item) => item.id !== id))
  }
  
  return (
    <section className="catalog">
      <div className="container">
        <h1>Избранное</h1>
        <p className="counter">Всего в избранном: {totalCount}</p>

        {isLoadingLocal && (
          <LoadingState
            title="Загружаем избранное"
            message="Проверяем сохраненные локации и подготавливаем список." 
          />
        )}

        {!isLoadingLocal && loadError && <ErrorState emoji="(T_T)" title="Ошибка загрузки избранного" message={loadError} />}

        {!isLoadingLocal && totalCount === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">💔</p>
            <p className="empty-title">Избранное пока пусто</p>
            <p className="empty-hint">Добавьте понравившиеся товары и развлечения из гида</p>
            <div className="empty-actions">
              <Link to="/catalog" className="empty-action-btn">
                Перейти в каталог
              </Link>
              <Link to="/attractions" className="empty-action-btn">
                Перейти в гид
              </Link>
            </div>
          </div>
        ) : !isLoadingLocal ? (
          <>
            {favoriteProducts.length > 0 && (
              <>
                <h2 style={{ margin: '24px 0 16px' }}>Товары</h2>
                <div className="grid">
                  {favoriteProducts.map((p) => (
                    <ProductCard key={p.id} product={p} isFavorite={true} onToggleFavorite={onToggleFavorite} />
                  ))}
                </div>
              </>
            )}

            {localItems.length > 0 && (
              <>
                <h2 style={{ margin: '24px 0 16px' }}>Развлечения и поездки с гидом</h2>
                <div className="grid">
                  {localItems.map((item) => (
                    <article key={item.id} className="card">
                      <img className="card__img" src={item.images[0]} alt={item.name} loading="lazy" />
                      <div className="card__body">
                        <p className="card__cat">{item.category}</p>
                        <h3 className="card__title">{item.name}</h3>
                        <p className="counter" style={{ margin: '6px 0 10px' }}>
                          {item.distanceKm} км • Рейтинг {item.rating.toFixed(1)}
                        </p>
                        <div className="card__actions">
                          <button
                            className="like-btn active"
                            onClick={() => removeLocalFavorite(item.id)}
                            aria-pressed={localItemIdSet.has(item.id)}
                          >
                            Убрать из избранного
                          </button>
                          <Link to="/attractions" className="cart-btn" style={{ textDecoration: 'none' }}>
                            Открыть в гиде
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </section>
  )
}
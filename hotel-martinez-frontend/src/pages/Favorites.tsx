import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/Cards/ProductCard'
import ErrorState from '../components/ErrorState/ErrorState'
import LoadingState from '../components/LoadingState/LoadingState'
import { useAuth } from '../context/AuthContext'
import { favoriteApi, productApi } from '../api'
import { fetchAttractionById } from '../data/attractions'
import type { Attraction } from '../types/local'
import type { Product } from '../types/product'
import '../styles/catalog.css'

type Props = {
  favorites: number[]
  onToggleFavorite: (id: number) => void
}

export default function Favorites({ favorites, onToggleFavorite }: Props) {
  const { user } = useAuth()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const favProducts = useMemo(() => allProducts.filter((p) => favorites.includes(p.id)), [allProducts, favorites])
  const [localItems, setLocalItems] = useState<Attraction[]>([])
  const [isLoadingLocal, setIsLoadingLocal] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const localCount = localItems.length
  const totalCount = favProducts.length + localCount

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoadingLocal(true)
      setLoadError(null)

      try {
        // Load products (for local favorites state)
        const products = await productApi.getAll()
        setAllProducts(products)

        // Load from API if user is authenticated (local attractions favorites)
        if (user?.id) {
          const apiFavorites = await favoriteApi.getUserFavorites(user.id)
          // Map API favorites to attractions (for entityType === 1, entityId is attractionId)
          const attractionFavs = apiFavorites.filter((fav) => fav.entityType === 1)
          const result = await Promise.all(attractionFavs.map((fav) => fetchAttractionById(fav.entityId.toString())))
          setLocalItems(result.filter((item): item is Attraction => item !== null))
        }
      } catch (err) {
        console.error('Failed to load favorites:', err)
        setLoadError('Не удалось загрузить избранное. Попробуйте позже.')
      } finally {
        setIsLoadingLocal(false)
      }
    }

    loadFavorites()
  }, [user?.id])

  const localItemIdSet = useMemo(() => new Set(localItems.map((item) => item.id)), [localItems])

  const removeLocalFavorite = (id: string) => {
    const currentIds = readLocalFavoriteIds()
    const updatedIds = currentIds.filter((favId) => favId !== id)
    saveLocalFavoriteIds(updatedIds)
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
            {favProducts.length > 0 && (
              <>
                <h2 style={{ margin: '24px 0 16px' }}>Товары</h2>
                <div className="grid">
                  {favProducts.map((p) => (
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

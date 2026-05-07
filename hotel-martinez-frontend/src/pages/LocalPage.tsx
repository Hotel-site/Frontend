import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import AttractionCard from '../components/AttractionCard/AttractionCard'
import DetailModal from '../components/DetailModal/DetailModal'
import FiltersPanel from '../components/FiltersPanel/FiltersPanel'
import Pagination from '../components/Pagination/Pagination'
import SearchBar from '../components/SearchBar/SearchBar'
import ErrorState from '../components/ErrorState/ErrorState'
import LoadingState from '../components/LoadingState/LoadingState'
import { useAttractions } from '../hooks/useAttractions'
import { fetchAttractionById, MAX_PRICE } from '../data/attractions'
import type { Attraction } from '../types/local'
import styles from '../styles/LocalPage.module.css'
import { translate } from '../utils/i18n'

const MapView = lazy(() => import('../components/MapView/MapView'))

export default function LocalPage() {
  const {
    query,
    items,
    total,
    totalPages,
    loading,
    error,
    viewMode,
    favoriteSet,
    setViewMode,
    setPage,
    updateSearch,
    updateCategory,
    updateMaxDistance,
    updateMinPrice,
    updateMaxPrice,
    updateOpenNow,
    updateSortBy,
    toggleFavorite,
    reload,
    setPageSize,
  } = useAttractions()

  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null)
  const [detailAttraction, setDetailAttraction] = useState<Attraction | null>(null)
  const mapSectionRef = useRef<HTMLElement | null>(null)
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({})

  const onMarkerSelect = (id: string) => {
    setSelectedAttractionId(id)
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const openDetails = async (id: string) => {
    const attraction = await fetchAttractionById(id)
    setDetailAttraction(attraction)
  }

  const renderedItems = useMemo(() => items, [items])

  useEffect(() => {
    if (viewMode === 'grid') {
      setPageSize(12)
    }
  }, [viewMode, setPageSize])

  return (
    <section className={styles.localPage}>
      <header className={styles.hero}>
        <div>
          <h1>{translate('localHeroTitle')}</h1>
          <p>{translate('localHeroSubtitle')}</p>
        </div>
      </header>

      <div className={styles.controls}>
        <SearchBar value={query.search} onChange={updateSearch} />
        <div className={styles.viewMode}>
          <button type="button" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
            ⊞ Сетка
          </button>
          <button type="button" aria-pressed={viewMode === 'map'} onClick={() => setViewMode('map')}>
            🗺️ Карта
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <FiltersPanel
          category={query.category}
          maxDistanceKm={query.maxDistanceKm}
          minPrice={query.minPrice}
          maxPrice={query.maxPrice}
          maxAvailablePrice={MAX_PRICE}
          openNow={query.openNow}
          sortBy={query.sortBy}
          onCategoryChange={updateCategory}
          onDistanceChange={updateMaxDistance}
          onMinPriceChange={updateMinPrice}
          onMaxPriceChange={updateMaxPrice}
          onOpenNowChange={updateOpenNow}
          onSortByChange={updateSortBy}
        />

        <div>
          <p className={styles.resultsInfo}>Найдено: {total}</p>

          {viewMode === 'map' ? (
            <section ref={mapSectionRef} className={styles.mapInline} aria-label="Карта развлечений">
              <Suspense fallback={<div className={styles.mapFallback}>{translate('loadingMap')}</div>}>
                <MapView attractions={items} selectedId={selectedAttractionId} onMarkerSelect={onMarkerSelect} />
              </Suspense>
            </section>
          ) : (
            <>
              {loading && <LoadingState title="Загружаем развлечения" message="Формируем подборку активностей рядом с отелем." />}
              {error && (
                <ErrorState
                  emoji="(>_<)"
                  title="Ошибка загрузки развлечений"
                  message={error}
                  onRetry={() => void reload()}
                />
              )}

              {!loading && !error && renderedItems.length === 0 && (
                <div className={styles.emptyState} role="status" aria-live="polite">
                  <p className={styles.emptyEmoji} aria-hidden="true">
                    (o_o)
                  </p>
                  <p className={styles.emptyTitle}>{translate('noResults')}</p>
                  <p className={styles.emptyHint}>Попробуйте изменить дистанцию, категорию или убрать фильтр «Открыто сейчас».</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  <ul className={clsx(styles.list, styles.grid)}>
                    {renderedItems.map((attraction) => (
                      <AttractionCard
                        key={attraction.id}
                        attraction={attraction}
                        viewMode={viewMode}
                        isFavorite={favoriteSet.has(attraction.id)}
                        onToggleFavorite={toggleFavorite}
                        onOpenDetails={(id) => void openDetails(id)}
                        cardRef={(node) => {
                          cardRefs.current[attraction.id] = node
                        }}
                      />
                    ))}
                  </ul>

                  <Pagination page={query.page} totalPages={totalPages} onPageChange={setPage} />
                </>
              )}
            </>
          )}
        </div>
      </div>

      <DetailModal attraction={detailAttraction} onClose={() => setDetailAttraction(null)} />
    </section>
  )
}

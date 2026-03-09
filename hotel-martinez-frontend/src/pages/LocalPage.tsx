import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import AttractionCard from '../components/AttractionCard'
import DetailModal from '../components/DetailModal'
import FiltersPanel from '../components/FiltersPanel'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import { useAttractions } from '../hooks/useAttractions'
import { fetchAttractionById } from '../services/localApi'
import type { Attraction } from '../types/local'
import styles from './LocalPage.module.css'
import { translate } from '../utils/i18n'

const MapView = lazy(() => import('../components/MapView'))

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
    updatePriceType,
    updateOpenNow,
    updateSortBy,
    toggleFavorite,
  } = useAttractions()

  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null)
  const [detailAttraction, setDetailAttraction] = useState<Attraction | null>(null)
  const [isMapVisible, setIsMapVisible] = useState(false)
  const mapSectionRef = useRef<HTMLElement | null>(null)
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({})

  const showMap = () => {
    setIsMapVisible(true)
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onMarkerSelect = (id: string) => {
    setSelectedAttractionId(id)
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const openDetails = async (id: string) => {
    const attraction = await fetchAttractionById(id)
    setDetailAttraction(attraction)
  }

  const renderedItems = useMemo(() => items, [items])

  return (
    <section className={styles.localPage}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>CITY CONCIERGE</p>
          <h1>{translate('localHeroTitle')}</h1>
          <p>{translate('localHeroSubtitle')}</p>
          <button type="button" className={styles.heroBtn} onClick={showMap}>
            {translate('viewOnMap')}
          </button>
        </div>
      </header>

      <div className={styles.controls}>
        <SearchBar value={query.search} onChange={updateSearch} />
        <div className={styles.viewMode}>
          <button type="button" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
            Grid
          </button>
          <button type="button" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}>
            List
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <FiltersPanel
          category={query.category}
          maxDistanceKm={query.maxDistanceKm}
          priceType={query.priceType}
          openNow={query.openNow}
          sortBy={query.sortBy}
          onCategoryChange={updateCategory}
          onDistanceChange={updateMaxDistance}
          onPriceTypeChange={updatePriceType}
          onOpenNowChange={updateOpenNow}
          onSortByChange={updateSortBy}
        />

        <div>
          <p className={styles.resultsInfo}>Найдено: {total}</p>

          {loading && <p>Загрузка...</p>}
          {error && <p role="alert">{error}</p>}

          {!loading && !error && renderedItems.length === 0 && (
            <div className={styles.emptyState} role="status" aria-live="polite">
              <p className={styles.emptyEmoji} aria-hidden="true">
                (o_o)
              </p>
              <p className={styles.emptyTitle}>{translate('noResults')}</p>
              <p className={styles.emptyHint}>Попробуйте изменить дистанцию, категорию или убрать фильтр «Открыто сейчас».</p>
            </div>
          )}

          <ul className={clsx(styles.list, viewMode === 'grid' ? styles.grid : styles.listMode)}>
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
        </div>
      </div>

      <section ref={mapSectionRef} className={styles.mapSection} aria-label="Карта развлечений">
        <Suspense fallback={<div className={styles.mapFallback}>{translate('loadingMap')}</div>}>
          {isMapVisible ? (
            <MapView attractions={items} selectedId={selectedAttractionId} onMarkerSelect={onMarkerSelect} />
          ) : (
            <div className={styles.mapFallback}>Нажмите «{translate('viewOnMap')}», чтобы загрузить карту.</div>
          )}
        </Suspense>
      </section>

      <DetailModal attraction={detailAttraction} onClose={() => setDetailAttraction(null)} />
    </section>
  )
}

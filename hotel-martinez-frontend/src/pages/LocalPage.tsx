import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import AttractionCard from '../components/AttractionCard/AttractionCard'
import DetailModal from '../components/DetailModal/DetailModal'
import FiltersPanel from '../components/FiltersPanel/FiltersPanel'
import Pagination from '../components/Pagination/Pagination'
import SearchBar from '../components/SearchBar/SearchBar'
import ErrorState from '../components/ErrorState/ErrorState'
import LoadingState from '../components/LoadingState/LoadingState'
import EmptyState from '../components/EmptyState/EmptyState'
import { useAttractions } from '../hooks/useAttractions'
import { fetchAttractionById, MAX_PRICE } from '../data/attractions'
import { categoryApi, type CategoryDto } from '../api'
import type { Attraction } from '../types/local'
import styles from '../styles/LocalPage.module.css'
import { translate } from '../utils/i18n'

export default function LocalPage() {
  const {
    query,
    items,
    total,
    totalPages,
    loading,
    error,
    favoriteSet,
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
  } = useAttractions()

  const [detailAttraction, setDetailAttraction] = useState<Attraction | null>(null)
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])

  // Load categories from API
  useEffect(() => {
    let cancelled = false

    categoryApi
      .getAll()
      .then((data: CategoryDto[]) => {
        if (cancelled) return
        const names = data.map((c: CategoryDto) => c.name).filter((x: string): x is string => typeof x === 'string' && x.length > 0)
        setCategoryOptions(Array.from(new Set(names)))
      })
      .catch((err: any) => {
        console.warn('Failed to load categories:', err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const openDetails = async (id: string) => {
    const attraction = await fetchAttractionById(id)
    setDetailAttraction(attraction)
  }

  const renderedItems = useMemo(() => items, [items])

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
          categories={categoryOptions}
          onCategoryChange={updateCategory}
          onDistanceChange={updateMaxDistance}
          onMinPriceChange={updateMinPrice}
          onMaxPriceChange={updateMaxPrice}
          onOpenNowChange={updateOpenNow}
          onSortByChange={updateSortBy}
        />

        <div>
          {loading && <LoadingState title="Загружаем развлечения" message="Формируем подборку активностей рядом с отелем." />}
          
          {!loading && error && (
            <ErrorState
              emoji="(>_<)"
              imageUrl="/cry.gif"
              title="Ошибка загрузки развлечений"
              message={error}
              onRetry={() => void reload()}
            />
          )}

          {!loading && !error && (
            <>
              {renderedItems.length === 0 ? (
                <EmptyState
                  emoji="(o_o)"
                  title={translate('noResults')}
                  hint="Попробуйте изменить дистанцию, категорию или убрать фильтр «Открыто сейчас»."
                  actionText="Обновить"
                  onAction={() => void reload()}
                />
              ) : (
                <>
                  <p className={styles.resultsInfo}>Найдено: {total}</p>
                  <ul className={clsx(styles.list, styles.grid)}>
                    {renderedItems.map((attraction) => (
                      <AttractionCard
                        key={attraction.id}
                        attraction={attraction}
                        viewMode="grid"
                        isFavorite={favoriteSet.has(attraction.id)}
                        onToggleFavorite={toggleFavorite}
                        onOpenDetails={(id) => void openDetails(id)}
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

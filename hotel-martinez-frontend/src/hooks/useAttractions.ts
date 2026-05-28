import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAttractions, MAX_PRICE } from '../data/attractions'
import type { Attraction, AttractionQueryParams, Category, SortBy, ViewMode } from '../types/local'

const defaultQuery: AttractionQueryParams = {
  search: '',
  category: 'all',
  maxDistanceKm: 25,
  minPrice: 0,
  maxPrice: MAX_PRICE,
  openNow: false,
  sortBy: 'rating',
  page: 1,
  pageSize: 12,
}

function readFavoriteIds(): string[] {
  try {
    const stored = localStorage.getItem('local-favorites')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveFavoriteIds(ids: string[]): void {
  try {
    localStorage.setItem('local-favorites', JSON.stringify(ids))
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function useAttractions() {
  const [query, setQuery] = useState<AttractionQueryParams>(defaultQuery)
  const [items, setItems] = useState<Attraction[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readFavoriteIds())

  useEffect(() => {
    saveFavoriteIds(favoriteIds)
    window.dispatchEvent(new Event('local-favorites-updated'))
  }, [favoriteIds])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchAttractions(query)
      setItems(response.items)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch {
      setError('Не удалось загрузить локальные развлечения')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    void load()
  }, [load])

  const updateSearch = useCallback((search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }))
  }, [])

  const updateCategory = useCallback((category: Category | 'all') => {
    setQuery((prev) => ({ ...prev, category, page: 1 }))
  }, [])

  const updateMaxDistance = useCallback((maxDistanceKm: number) => {
    setQuery((prev) => ({ ...prev, maxDistanceKm, page: 1 }))
  }, [])

  const updateMinPrice = useCallback((minPrice: number) => {
    setQuery((prev) => ({ ...prev, minPrice, page: 1 }))
  }, [])

  const updateMaxPrice = useCallback((maxPrice: number) => {
    setQuery((prev) => ({ ...prev, maxPrice, page: 1 }))
  }, [])

  const updateOpenNow = useCallback((openNow: boolean) => {
    setQuery((prev) => ({ ...prev, openNow, page: 1 }))
  }, [])

  const updateSortBy = useCallback((sortBy: SortBy) => {
    setQuery((prev) => ({ ...prev, sortBy }))
  }, [])

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setQuery((prev) => ({ ...prev, pageSize, page: 1 }))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  return {
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
    setPageSize,
    updateSearch,
    updateCategory,
    updateMaxDistance,
    updateMinPrice,
    updateMaxPrice,
    updateOpenNow,
    updateSortBy,
    toggleFavorite,
    reload: load,
  }
}

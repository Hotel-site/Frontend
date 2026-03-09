import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAttractions } from '../services/localApi'
import type { Attraction, AttractionQueryParams, Category, PriceType, SortBy, ViewMode } from '../types/local'

const FAVORITES_KEY = 'local-favorites'

const defaultQuery: AttractionQueryParams = {
  search: '',
  category: 'all',
  maxDistanceKm: 25,
  priceType: 'all',
  openNow: false,
  sortBy: 'popularity',
  page: 1,
  pageSize: 5,
}

function readFavoriteIds(): string[] {
  const value = localStorage.getItem(FAVORITES_KEY)

  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
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
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds))
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

  const updatePriceType = useCallback((priceType: PriceType | 'all') => {
    setQuery((prev) => ({ ...prev, priceType, page: 1 }))
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
    updateSearch,
    updateCategory,
    updateMaxDistance,
    updatePriceType,
    updateOpenNow,
    updateSortBy,
    toggleFavorite,
    reload: load,
  }
}

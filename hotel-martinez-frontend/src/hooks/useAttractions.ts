import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAttractions, MAX_PRICE } from '../data/attractions'
import type { Attraction, AttractionQueryParams, Category, PriceType, SortBy, ViewMode } from '../types/local'

const FAVORITES_KEY = 'local-favorites'

const defaultQuery: AttractionQueryParams = {
  search: '',
  category: 'all',
  maxDistanceKm: 25,
  priceType: 'all',
  minPrice: 0,
  maxPrice: MAX_PRICE,
  openNow: false,
  sortBy: 'popularity',
  page: 1,
  pageSize: 12,
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

  const getPriceTypeForRange = useCallback((minPrice: number, maxPrice: number): PriceType | 'all' => {
    if (minPrice === 0 && maxPrice === 0) return 'free'
    if (minPrice === 0 && maxPrice === 50) return 'budget'
    if (minPrice === 50 && maxPrice === 150) return 'moderate'
    if (minPrice === 150 && maxPrice === 500) return 'premium'
    return 'all'
  }, [])

  const updatePriceType = useCallback((priceType: PriceType | 'all') => {
    const priceRanges: Record<PriceType | 'all', { min: number; max: number }> = {
      'all': { min: 0, max: MAX_PRICE },
      'free': { min: 0, max: 0 },
      'budget': { min: 0, max: 50 },
      'moderate': { min: 50, max: 150 },
      'premium': { min: 150, max: MAX_PRICE },
    }
    const range = priceRanges[priceType]
    setQuery((prev) => ({ ...prev, priceType, minPrice: range.min, maxPrice: range.max, page: 1 }))
  }, [])

  const updateMinPrice = useCallback((minPrice: number) => {
    setQuery((prev) => {
      const newPriceType = getPriceTypeForRange(minPrice, prev.maxPrice)
      return { ...prev, minPrice, priceType: newPriceType, page: 1 }
    })
  }, [getPriceTypeForRange])

  const updateMaxPrice = useCallback((maxPrice: number) => {
    setQuery((prev) => {
      const newPriceType = getPriceTypeForRange(prev.minPrice, maxPrice)
      return { ...prev, maxPrice, priceType: newPriceType, page: 1 }
    })
  }, [getPriceTypeForRange])

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
    updatePriceType,
    updateMinPrice,
    updateMaxPrice,
    updateOpenNow,
    updateSortBy,
    toggleFavorite,
    reload: load,
  }
}

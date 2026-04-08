import { useMemo, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/Cards/ProductCard'
import ProductDetailModal from '../components/DetailModal/ProductDetailModal'
import SearchBar from '../components/SearchBar/SearchBar'
import Pagination from '../components/Pagination/Pagination'
import CatalogFiltersPanel, { BUDGET_RANGES, type BudgetType } from '../components/CatalogFiltersPanel/CatalogFiltersPanel'
import { products } from '../data/products'
import type { Product } from '../types/product'
import '../styles/catalog.css'

type Props = {
  favorites: number[]
  onToggleFavorite: (id: number) => void
  onAddToCart: (id: number) => void
}

export default function Catalog({ favorites, onToggleFavorite, onAddToCart }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0) 
  const [budget, setBudget] = useState<BudgetType>('all')
  const [sortBy, setSortBy] = useState('default')
  const [likes, setLikes] = useState<Record<number, number>>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 12 

  const isAutomaticPriceChange = useRef(false)

  // Открытие товара по ID из URL параметров
  useEffect(() => {
    const productId = searchParams.get('productId')
    if (productId) {
      const product = products.find(p => p.id === parseInt(productId))
      if (product) {
        setSelectedProduct(product)
      }
      // Удалить параметр из URL после открытия
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const categories = useMemo(
    () => ['Все', ...Array.from(new Set(products.map((p) => p.category)))],
    []
  )

  const maxProductPrice = useMemo(
    () => Math.max(...products.map((p) => p.price)),
    []
  )

  useEffect(() => {
    setMaxPrice(maxProductPrice)
  }, [maxProductPrice])

  useEffect(() => {
    isAutomaticPriceChange.current = true
    
    if (budget === 'all') {
      // Когда выбран 'Любой' - устанавливаем полный диапазон
      setMinPrice(0)
      setMaxPrice(maxProductPrice)
    } else {
      // Когда выбрана конкретная категория - устанавливаем её диапазон
      const range = BUDGET_RANGES[budget]
      if (range) {
        setMinPrice(range.min)
        if (budget === 'premium') {
          setMaxPrice(maxProductPrice)
        } else {
          setMaxPrice(range.max)
        }
      }
    }
  }, [budget, maxProductPrice])

  // Сброс категории бюджета при ручном изменении ползунков
  useEffect(() => {
    // Пропускаем проверку, если это была автоматическая смена
    if (isAutomaticPriceChange.current) {
      isAutomaticPriceChange.current = false
      return
    }

    // Если выбран какой-то конкретный бюджет и ползунки не совпадают - сбрасываем
    if (budget !== 'all') {
      const range = BUDGET_RANGES[budget]
      if (range) {
        let expectedMax = range.max
        if (budget === 'premium') {
          expectedMax = maxProductPrice
        }
        
        if (minPrice !== range.min || maxPrice !== expectedMax) {
          setBudget('all')
        }
      }
    }
  }, [minPrice, maxPrice, budget, maxProductPrice])

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const byCategory = category === 'Все' || p.category === category
      const byQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      const byPrice = p.price >= minPrice && p.price <= maxPrice

      let byBudget = true
      if (budget !== 'all') {
        const range = BUDGET_RANGES[budget]
        if (range) {
          byBudget = p.price >= range.min && p.price <= range.max
        }
      }

      return byCategory && byQuery && byPrice && byBudget
    })

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
        break
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title, 'ru'))
        break
      default:
        break
    }

    return result
  }, [query, category, minPrice, maxPrice, budget, sortBy])

  // Пагинация
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedItems = useMemo(
    () => filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [filtered, currentPage]
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [query, category, minPrice, maxPrice, budget, sortBy])

  const handleLike = (id: number) => {
    setLikes((prev) => ({
      ...prev,
      [id]: prev[id] ? 0 : 1,
    }))
  }

  const handleResetFilters = () => {
    setQuery('')
    setCategory('Все')
    setMinPrice(0)
    setMaxPrice(maxProductPrice)
    setBudget('all')
    setSortBy('default')
  }

  return (
    <section className="catalog">
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <div className="catalog-container">
        <div className="catalog-main">
          <div className="catalog-header">
            <h1>Каталог услуг и предложений</h1>
            <p className="catalog-counter">
              Найдено: <strong>{filtered.length}</strong> | В избранном: <strong>{favorites.length}</strong>
            </p>
          </div>

          <div className="catalog-search-wrapper">
            <SearchBar value={query} onChange={setQuery} />
          </div>

          {filtered.length === 0 ? (
            <div className="catalog-empty-state">
              <p className="empty-emoji">😢</p>
              <p className="empty-title">Ничего не найдено</p>
              <p className="empty-hint">Попробуйте изменить фильтры или поисковый запрос</p>
              <button className="empty-reset-btn" onClick={handleResetFilters}>
                Очистить все фильтры
              </button>
            </div>
          ) : (
            <div className="catalog-grid">
              {paginatedItems.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={onToggleFavorite}
                  likes={likes[p.id] || 0}
                  onViewDetails={() => setSelectedProduct(p)}
                  onLike={() => handleLike(p.id)}
                  onAddToCart={() => onAddToCart(p.id)}
                />
              ))}
            </div>
          )}

          {filtered.length > 0 && totalPages > 1 && (
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>

        <CatalogFiltersPanel
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          budget={budget}
          sortBy={sortBy}
          onCategoryChange={setCategory}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onBudgetChange={setBudget}
          onSortByChange={setSortBy}
          onResetFilters={handleResetFilters}
          categories={categories}
          maxProductPrice={maxProductPrice}
        />
      </div>
    </section>
  )
}

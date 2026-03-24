import styles from './CatalogFiltersPanel.module.css'

type BudgetType = 'all' | 'budget' | 'moderate' | 'premium'

type CatalogFiltersPanelProps = {
  category: string
  minPrice: number
  maxPrice: number
  budget: BudgetType
  sortBy: string
  onCategoryChange: (category: string) => void
  onMinPriceChange: (price: number) => void
  onMaxPriceChange: (price: number) => void
  onBudgetChange: (budget: BudgetType) => void
  onSortByChange: (sort: string) => void
  onResetFilters: () => void
  categories: string[]
  maxProductPrice: number
}

const BUDGET_RANGES: Record<BudgetType, { min: number; max: number; label: string } | null> = {
  all: null,
  budget: { min: 0, max: 100, label: 'Бюджетно' },
  moderate: { min: 100, max: 500, label: 'Средний уровень' },
  premium: { min: 500, max: 10000, label: 'Премиум' },
}

export default function CatalogFiltersPanel({
  category,
  minPrice,
  maxPrice,
  budget,
  sortBy,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onBudgetChange,
  onSortByChange,
  onResetFilters,
  categories,
  maxProductPrice,
}: CatalogFiltersPanelProps) {
  return (
    <aside className={styles.panel} aria-label="Панель фильтров каталога">
      <div className={styles.headerBlock}>
        <h3 className={styles.title}>Фильтры</h3>
        <button className={styles.resetBtn} onClick={onResetFilters} title="Очистить все фильтры">
          ✕
        </button>
      </div>

      {/* Категория */}
      <div className={styles.field}>
        <label htmlFor="category-select" className={styles.label}>
          Категория
        </label>
        <select
          id="category-select"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={styles.select}
        >
          <option value="Все">Все категории</option>
          {categories.filter((c) => c !== 'Все').map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Диапазон цены */}
      <div className={styles.field}>
        <label className={styles.label}>Цена</label>
        <div className={styles.priceRange}>
          <div className={styles.priceInputGroup}>
            <label htmlFor="min-price" className={styles.priceLabel}>
              От
            </label>
            <input
              id="min-price"
              type="number"
              min="0"
              max={maxProductPrice}
              value={minPrice}
              onChange={(event) => onMinPriceChange(Number(event.target.value))}
              className={styles.priceInput}
            />
            <span className={styles.currency}>€</span>
          </div>

          <div className={styles.priceInputGroup}>
            <label htmlFor="max-price" className={styles.priceLabel}>
              До
            </label>
            <input
              id="max-price"
              type="number"
              min="0"
              max={maxProductPrice}
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(Number(event.target.value))}
              className={styles.priceInput}
            />
            <span className={styles.currency}>€</span>
          </div>
        </div>

        {/* Визуальный слайдер */}
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="0"
            max={maxProductPrice}
            value={minPrice}
            onChange={(event) => {
              const newValue = Number(event.target.value)
              if (newValue <= maxPrice) {
                onMinPriceChange(newValue)
              }
            }}
            className={`${styles.slider} ${styles.sliderMin}`}
            aria-label="Минимальная цена"
          />
          <input
            type="range"
            min="0"
            max={maxProductPrice}
            value={maxPrice}
            onChange={(event) => {
              const newValue = Number(event.target.value)
              if (newValue >= minPrice) {
                onMaxPriceChange(newValue)
              }
            }}
            className={`${styles.slider} ${styles.sliderMax}`}
            aria-label="Максимальная цена"
          />
          <div className={styles.sliderTrack} />
        </div>

        <div className={styles.priceDisplay}>
          €{minPrice.toLocaleString()} – €{maxPrice.toLocaleString()}
        </div>
      </div>

      {/* Категории бюджета */}
      <div className={styles.field}>
        <label className={styles.label}>Категория бюджета</label>
        <div className={styles.budgetFilters}>
          {[
            { value: 'all' as const, label: 'Любой' },
            { value: 'budget' as const, label: 'Бюджетный' },
            { value: 'moderate' as const, label: 'Средний' },
            { value: 'premium' as const, label: 'Премиум' },
          ].map((option) => (
            <label key={option.value} className={styles.budgetOption}>
              <input
                type="radio"
                name="budget"
                value={option.value}
                checked={budget === option.value}
                onChange={() => onBudgetChange(option.value)}
                className={styles.budgetRadio}
                hidden
              />
              <span className={styles.budgetLabel}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Сортировка */}
      <div className={styles.field}>
        <label htmlFor="sort-select" className={styles.label}>
          Сортировка
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
          className={styles.select}
        >
          <option value="default">По умолчанию</option>
          <option value="price-asc">Цена: низкая → высокая</option>
          <option value="price-desc">Цена: высокая → низкая</option>
          <option value="title-asc">Название: А → Я</option>
          <option value="title-desc">Название: Я → А</option>
        </select>
      </div>
    </aside>
  )
}

export { BUDGET_RANGES }
export type { BudgetType }

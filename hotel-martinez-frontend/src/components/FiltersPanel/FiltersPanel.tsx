import type { Category, SortBy } from '../../types/local'
import styles from './FiltersPanel.module.css'
import { translate } from '../../utils/i18n'

type FiltersPanelProps = {
  category: Category | 'all'
  maxDistanceKm: number
  minPrice: number
  maxPrice: number
  maxAvailablePrice: number
  openNow: boolean
  sortBy: SortBy
  categories: string[]
  onCategoryChange: (value: Category | 'all') => void
  onDistanceChange: (value: number) => void
  onMinPriceChange: (value: number) => void
  onMaxPriceChange: (value: number) => void
  onOpenNowChange: (value: boolean) => void
  onSortByChange: (value: SortBy) => void
}

const PRICE_RANGES = (
  maxAvailablePrice: number,
): Array<{ id: string; label: string; min: number; max: number }> => [
  { id: 'any', label: 'Любое', min: 0, max: maxAvailablePrice },
  { id: 'free', label: 'Бесплатно', min: 0, max: 0 },
  { id: 'budget', label: 'Бюджетный', min: 0, max: 50 },
  { id: 'medium', label: 'Средний', min: 50, max: 150 },
  { id: 'premium', label: 'Премиум', min: 150, max: maxAvailablePrice },
]

function getPriceRangeId(
  minPrice: number,
  maxPrice: number,
  actualMaxPrice: number,
): string | null {
  if (minPrice === 0 && maxPrice === 0) return 'free'
  if (minPrice === 0 && maxPrice === 50) return 'budget'
  if (minPrice === 50 && maxPrice === 150) return 'medium'
  if (minPrice === 150 && maxPrice === actualMaxPrice) return 'premium'
  if (minPrice === 0 && maxPrice === actualMaxPrice) return 'any'
  return null
}

export default function FiltersPanel({
  category,
  maxDistanceKm,
  minPrice,
  maxPrice,
  maxAvailablePrice,
  openNow,
  sortBy,
  categories,
  onCategoryChange,
  onDistanceChange,
  onMinPriceChange,
  onMaxPriceChange,
  onOpenNowChange,
  onSortByChange,
}: FiltersPanelProps) {
  return (
    <aside className={styles.panel} aria-label="Панель фильтров развлечений">
      <label className={styles.field}>
        Категория
        <select value={category} onChange={(event) => onCategoryChange(event.target.value as Category | 'all')}>
          <option value="all">{translate('allCategories')}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        Максимальная дистанция: {maxDistanceKm} км
        <input
          type="range"
          min={1}
          max={25}
          value={maxDistanceKm}
          onChange={(event) => onDistanceChange(Number(event.target.value))}
        />
      </label>

      <label className={styles.field}>
        Ценовой диапазон
        <div className={styles.priceRange}>
          <div className={styles.priceInputGroup}>
            <div>
              <label>От</label>
              <input
                type="number"
                min={0}
                max={maxPrice}
                value={minPrice}
                onChange={(event) => onMinPriceChange(Math.min(Number(event.target.value), maxPrice))}
              />
            </div>
            <div>
              <label>До</label>
              <input
                type="number"
                min={0}
                max={maxPrice}
                value={maxPrice}
                onChange={(event) => onMaxPriceChange(Math.max(Number(event.target.value), minPrice))}
              />
            </div>
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderTrack} />
            <div
              className={styles.sliderTrackActive}
              style={{
                left: `${(minPrice / maxAvailablePrice) * 100}%`,
                right: `${100 - (maxPrice / maxAvailablePrice) * 100}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={maxAvailablePrice}
              value={minPrice}
              onChange={(event) => {
                const newValue = Number(event.target.value)
                if (newValue <= maxPrice) {
                  onMinPriceChange(newValue)
                }
              }}
              className={`${styles.slider} ${styles.sliderMin}`}
            />
            <input
              type="range"
              min={0}
              max={maxAvailablePrice}
              value={maxPrice}
              onChange={(event) => {
                const newValue = Number(event.target.value)
                if (newValue >= minPrice) {
                  onMaxPriceChange(newValue)
                }
              }}
              className={`${styles.slider} ${styles.sliderMax}`}
            />
          </div>

          <div className={styles.priceDisplay}>
            €{minPrice} – €{maxPrice}
          </div>

          <div className={styles.priceCategories}>
            {PRICE_RANGES(maxAvailablePrice).map((range) => {
              const isActive = getPriceRangeId(minPrice, maxPrice, maxAvailablePrice) === range.id
              return (
                <button
                  key={range.id}
                  type="button"
                  className={`${styles.priceOption} ${isActive ? styles.active : ''}`}
                  onClick={() => {
                    onMinPriceChange(range.min)
                    onMaxPriceChange(range.max)
                  }}
                >
                  {range.label}
                </button>
              )
            })}
          </div>
        </div>
      </label>

      <label className={styles.checkboxField}>
        <input type="checkbox" checked={openNow} onChange={(event) => onOpenNowChange(event.target.checked)} />
        {translate('openNow')}
      </label>

      <label className={styles.field}>
        Сортировка
        <select value={sortBy} onChange={(event) => onSortByChange(event.target.value as SortBy)}>
          <option value="distance">{translate('sortDistance')}</option>
          <option value="rating">{translate('sortRating')}</option>
          <option value="priceAsc">{translate('sortPriceAsc')}</option>
          <option value="priceDesc">{translate('sortPriceDesc')}</option>
        </select>
      </label>
    </aside>
  )
}

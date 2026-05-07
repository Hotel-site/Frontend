import type { Category, SortBy } from '../../types/local'
import styles from './FiltersPanel.module.css'
import { translate } from '../../utils/i18n'

type FiltersPanelProps = {
  category: Category | 'all'
  maxDistanceKm: number
  minPrice: number
  maxPrice: number
  openNow: boolean
  sortBy: SortBy
  onCategoryChange: (value: Category | 'all') => void
  onDistanceChange: (value: number) => void
  onMinPriceChange: (value: number) => void
  onMaxPriceChange: (value: number) => void
  onOpenNowChange: (value: boolean) => void
  onSortByChange: (value: SortBy) => void
}

const categoryOptions: Array<{ value: Category | 'all'; label: string }> = [
  { value: 'all', label: translate('allCategories') },
  { value: 'culture', label: 'Культура' },
  { value: 'nature', label: 'Природа' },
  { value: 'food', label: 'Еда' },
  { value: 'shopping', label: 'Шопинг' },
  { value: 'family', label: 'Семейный отдых' },
  { value: 'nightlife', label: 'Ночная жизнь' },
]

const PRICE_RANGES = [
  { label: 'Любое', min: 0, max: 500 },
  { label: 'Бесплатно', min: 0, max: 0 },
  { label: 'Бюджетный', min: 0, max: 50 },
  { label: 'Средний', min: 50, max: 150 },
  { label: 'Премиум', min: 150, max: 500 },
]

export default function FiltersPanel({
  category,
  maxDistanceKm,
  minPrice,
  maxPrice,
  openNow,
  sortBy,
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
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
                max={500}
                value={minPrice}
                onChange={(event) => onMinPriceChange(Math.min(Number(event.target.value), maxPrice))}
              />
            </div>
            <div>
              <label>До</label>
              <input
                type="number"
                min={0}
                max={500}
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
                left: `${(minPrice / 500) * 100}%`,
                right: `${100 - (maxPrice / 500) * 100}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={500}
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
              max={500}
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
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                type="button"
                className={`${styles.priceOption} ${minPrice === range.min && maxPrice === range.max ? styles.active : ''}`}
                onClick={() => {
                  onMinPriceChange(range.min)
                  onMaxPriceChange(range.max)
                }}
              >
                {range.label}
              </button>
            ))}
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
          <option value="popularity">{translate('sortPopularity')}</option>
          <option value="distance">{translate('sortDistance')}</option>
          <option value="rating">{translate('sortRating')}</option>
        </select>
      </label>
    </aside>
  )
}

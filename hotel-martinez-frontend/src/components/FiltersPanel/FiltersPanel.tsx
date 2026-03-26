import type { Category, PriceType, SortBy } from '../../types/local'
import styles from './FiltersPanel.module.css'
import { translate } from '../../utils/i18n'

type FiltersPanelProps = {
  category: Category | 'all'
  priceType: PriceType | 'all'
  maxDistanceKm: number
  minPrice: number
  maxPrice: number
  openNow: boolean
  sortBy: SortBy
  onCategoryChange: (value: Category | 'all') => void
  onPriceTypeChange: (value: PriceType | 'all') => void
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

const PRICE_CATEGORIES: Array<{ value: PriceType | 'all'; label: string }> = [
  { value: 'all', label: 'Любой' },
  { value: 'free', label: 'Бесплатно' },
  { value: 'budget', label: 'Бюджетный' },
  { value: 'moderate', label: 'Средний' },
  { value: 'premium', label: 'Премиум' },
]

export default function FiltersPanel({
  category,
  priceType,
  maxDistanceKm,
  minPrice,
  maxPrice,
  openNow,
  sortBy,
  onCategoryChange,
  onPriceTypeChange,
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
                max={150}
                value={minPrice}
                onChange={(event) => onMinPriceChange(Math.min(Number(event.target.value), maxPrice))}
              />
            </div>
            <div>
              <label>До</label>
              <input
                type="number"
                min={0}
                max={150}
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
                left: `${(minPrice / 150) * 100}%`,
                right: `${100 - (maxPrice / 150) * 100}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={150}
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
              max={150}
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
        </div>
      </label>

      <div className={styles.field}>
        <div className={styles.priceCategories}>
          {PRICE_CATEGORIES.map((option) => (
            <label key={option.value} className={styles.priceOption}>
              <input
                type="radio"
                name="priceType"
                value={option.value}
                checked={priceType === option.value}
                onChange={() => onPriceTypeChange(option.value)}
                hidden
              />
              <span className={styles.priceLabel}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

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

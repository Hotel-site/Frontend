import type { Category, PriceType, SortBy } from '../types/local'
import styles from './FiltersPanel.module.css'
import { translate } from '../utils/i18n'

type FiltersPanelProps = {
  category: Category | 'all'
  maxDistanceKm: number
  priceType: PriceType | 'all'
  openNow: boolean
  sortBy: SortBy
  onCategoryChange: (value: Category | 'all') => void
  onDistanceChange: (value: number) => void
  onPriceTypeChange: (value: PriceType | 'all') => void
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

const priceOptions: Array<{ value: PriceType | 'all'; label: string }> = [
  { value: 'all', label: translate('allPrices') },
  { value: 'free', label: 'Бесплатно' },
  { value: 'budget', label: 'Бюджетно' },
  { value: 'moderate', label: 'Средний чек' },
  { value: 'premium', label: 'Премиум' },
]

export default function FiltersPanel({
  category,
  maxDistanceKm,
  priceType,
  openNow,
  sortBy,
  onCategoryChange,
  onDistanceChange,
  onPriceTypeChange,
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
        Ценовая категория
        <select value={priceType} onChange={(event) => onPriceTypeChange(event.target.value as PriceType | 'all')}>
          {priceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

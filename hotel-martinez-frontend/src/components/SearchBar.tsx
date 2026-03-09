import type { ChangeEvent } from 'react'
import styles from './SearchBar.module.css'
import { translate } from '../utils/i18n'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>{translate('searchPlaceholder')}</span>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={translate('searchPlaceholder')}
        aria-label={translate('searchPlaceholder')}
        className={styles.input}
      />
    </label>
  )
}

import styles from './Pagination.module.css'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <nav className={styles.pagination} aria-label="Пагинация">
      <button type="button" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
        Назад
      </button>
      <span>
        Страница {page} из {totalPages}
      </span>
      <button type="button" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
        Вперед
      </button>
    </nav>
  )
}

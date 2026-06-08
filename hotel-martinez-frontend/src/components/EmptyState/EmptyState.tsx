import { Link } from 'react-router-dom'
import styles from './EmptyState.module.css'

type Props = {
  emoji: string
  title: string
  hint?: string
  linkTo?: string
  linkText?: string
  onAction?: () => void
  actionText?: string
  minHeight?: string
}

export default function EmptyState({
  emoji,
  title,
  hint,
  linkTo,
  linkText,
  onAction,
  actionText,
  minHeight,
}: Props) {
  return (
    <div className={styles.root} style={minHeight ? { minHeight } : undefined}>
      <p className={styles.emoji}>{emoji}</p>
      <p className={styles.title}>{title}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
      {linkTo && linkText && (
        <Link to={linkTo} className={styles.button}>
          {linkText}
        </Link>
      )}
      {actionText && onAction && (
        <button type="button" className={styles.button} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  )
}
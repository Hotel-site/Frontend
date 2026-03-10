import { useState } from 'react'
import styles from './ErrorState.module.css'

type Props = {
  title?: string
  message?: string
  emoji?: string
  imageUrl?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Что-то пошло не так',
  message = 'Попробуйте обновить страницу или повторить действие позже.',
  emoji = '(x_x)',
  imageUrl = '/cry.gif',
  onRetry,
}: Props) {
  const [isImageFailed, setIsImageFailed] = useState(false)

  return (
    <div className={styles.root} role="alert" aria-live="assertive">
      {imageUrl && !isImageFailed ? (
        <img className={styles.media} src={imageUrl} alt="" loading="lazy" onError={() => setIsImageFailed(true)} />
      ) : (
        <p className={styles.emoji} aria-hidden="true">
          {emoji}
        </p>
      )}
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  )
}
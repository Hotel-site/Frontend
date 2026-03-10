import styles from './LoadingState.module.css'

type Props = {
  title?: string
  message?: string
}

export default function LoadingState({
  title = 'Загрузка...',
  message = 'Немного подождите, мы подготавливаем данные.',
}: Props) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
    </div>
  )
}
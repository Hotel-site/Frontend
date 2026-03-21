import { useEffect, useState } from 'react'
import type { Product } from '../../types/product'
import styles from './DetailModal.module.css'

type ProductDetailModalProps = {
  product: Product | null
  onClose: () => void
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = product?.images?.length ? product.images : (product ? [product.image] : [])

  useEffect(() => {
    if (!product) {
      return
    }

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft' && images.length > 1) {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
      } else if (event.key === 'ArrowRight' && images.length > 1) {
        setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
      }
    }

    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [product, onClose, images.length])

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0)
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [product])

  if (!product) {
    return null
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Закрыть детальную информацию"
          className={styles.closeBtn}
          onClick={onClose}
        >
          x
        </button>

        <div className={styles.content}>
          <div className={styles.imageGallery}>
            <img
              src={images[currentImageIndex]}
              alt={`${product.title} - фото ${currentImageIndex + 1}`}
              className={styles.productImage}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className={styles.navButtonPrev}
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                  }
                  aria-label="Предыдущее фото"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className={styles.navButtonNext}
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                  }
                  aria-label="Следующее фото"
                >
                  ›
                </button>

                <div className={styles.imageIndicators}>
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`${styles.indicator} ${index === currentImageIndex ? styles.indicatorActive : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Перейти на фото ${index + 1}`}
                      aria-current={index === currentImageIndex}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.details}>
            <h2 id="product-detail-title">{product.title}</h2>

            <div className={styles.productInfo}>
              <p className={styles.category}>Категория: {product.category}</p>
              <p className={styles.price}>
                Цена: {product.price.toLocaleString('de-DE')} {product.unit ?? '€'}
              </p>
            </div>

            <div className={styles.rating}>
              <span>★★★★★ (15 отзывов)</span>
            </div>

            {product.description && (
              <div className={styles.description}>
                <h3>Описание</h3>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { productApi } from '../../api'
import type { Product } from '../../types/product'
import styles from './DetailModal.module.css'

type ProductDetailModalProps = {
  product: Product | null
  onClose: () => void
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [fullProduct, setFullProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const lastRequestedIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!product) {
      lastRequestedIdRef.current = null
      setFullProduct(null)
      setIsLoading(false)
      return
    }

    lastRequestedIdRef.current = null
    setFullProduct(null)
  }, [product?.id])

  // Load full product details by ID when modal opens
  useEffect(() => {
    const productId = product?.id
    if (!productId) {
      return
    }

    if (fullProduct?.id === productId) {
      return
    }

    if (lastRequestedIdRef.current === productId) {
      return
    }

    lastRequestedIdRef.current = productId

    let cancelled = false
    setIsLoading(true)

    productApi
      .getById(productId)
      .then((data) => {
        if (cancelled) return
        setFullProduct(data)
      })
      .catch((err) => {
        console.error('Failed to load product details:', err)
        if (cancelled) return
        setFullProduct(product)
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [product?.id, fullProduct?.id])

  const displayProduct = product
    ? fullProduct && fullProduct.id === product.id
      ? fullProduct
      : product
    : null

  const images = displayProduct?.images?.length
    ? displayProduct.images
    : displayProduct
      ? [displayProduct.image]
      : []

  const renderDescription = (text: string) => {
    const lines = text.split(/\r?\n/)
    const nodes: ReactNode[] = []
    let listItems: string[] = []
    let lastWasGap = false

    const flushList = () => {
      if (!listItems.length) {
        return
      }

      const items = listItems
      listItems = []
      lastWasGap = false

      const parsePrice = (text: string) => {
        const match = text.match(/^(.*?)(?:\s*[—-]\s*|\s+)(\d+(?:[.,]\d+)?\s?(?:€|EUR))$/i)
        if (!match) {
          return { label: text, price: null as string | null }
        }

        return { label: match[1].trim(), price: match[2].trim() }
      }

      nodes.push(
        <ul key={`list-${nodes.length}`} className={styles.descriptionList}>
          {items.map((item, index) => {
            const { label, price } = parsePrice(item)

            return (
              <li key={index} className={styles.descriptionListItem}>
                <span className={styles.descriptionItemText}>{label}</span>
                {price && <span className={styles.descriptionPrice}>{price}</span>}
              </li>
            )
          })}
        </ul>,
      )
    }

    const isSectionTitle = (line: string) => {
      const normalized = line.replace(/\s+/g, ' ').trim()
      return /^[A-ZА-ЯЁ0-9\s]+$/.test(normalized) && normalized.length > 0 && normalized.length <= 32
    }

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (!line) {
        flushList()
        if (nodes.length && !lastWasGap) {
          nodes.push(<div key={`gap-${nodes.length}`} className={styles.descriptionGap} />)
          lastWasGap = true
        }
        continue
      }

      if (line.startsWith('•')) {
        lastWasGap = false
        listItems.push(line.replace(/^•\s*/, ''))
        continue
      }

      flushList()
      lastWasGap = false

      if (isSectionTitle(line)) {
        nodes.push(
          <h4 key={`h-${nodes.length}`} className={styles.descriptionSectionTitle}>
            {line}
          </h4>,
        )
      } else {
        nodes.push(<p key={`p-${nodes.length}`}>{line}</p>)
      }
    }

    flushList()

    return <div className={styles.descriptionText}>{nodes}</div>
  }

  useEffect(() => {
    if (!displayProduct) {
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
  }, [displayProduct, onClose, images.length])

  useEffect(() => {
    if (displayProduct) {
      setCurrentImageIndex(0)
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [displayProduct])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!displayProduct) {
    return null
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={handleOverlayClick}
    >
      <div className={styles.modal}>
        <button
          type="button"
          aria-label="Закрыть детальную информацию"
          className={styles.closeBtn}
          onClick={onClose}
        >
          x
        </button>

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
            <p>Загружаем полную информацию...</p>
          </div>
        )}

        {!isLoading && (
          <div className={styles.content}>
            <div className={styles.imageGallery}>
              <img
                src={images[currentImageIndex]}
                alt={`${displayProduct.title} - фото ${currentImageIndex + 1}`}
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
              <h2 id="product-detail-title">{displayProduct.title}</h2>

              <div className={styles.productInfo}>
                <p className={styles.category}>Категория: {displayProduct.category}</p>
                <p className={styles.price}>
                  Цена: {displayProduct.price.toLocaleString('de-DE')} €
                </p>
              </div>

              {displayProduct.description && (
                <div className={styles.description}>
                  <h3>Описание</h3>
                  {renderDescription(displayProduct.description)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

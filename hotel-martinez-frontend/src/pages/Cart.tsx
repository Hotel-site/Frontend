import { useMemo, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderApi, productApi, roomApi } from '../api'
import type { CartItem } from '../types/cart'
import '../styles/cart.css'

const CART_ITEM_TYPE_PRODUCT = 0
const CART_ITEM_TYPE_ROOM = 1

type Props = {
  onCheckout: () => void
}

export default function Cart({ onCheckout }: Props) {
  const { user } = useAuth()
  const [serverCart, setServerCart] = useState<any>(null)
  const [productCache, setProductCache] = useState<Record<number, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  })

  const userId = user?.id ? Number(user.id) : NaN

  const loadCart = useCallback(async () => {
    if (!Number.isFinite(userId)) return
    setIsLoading(true)
    setError(null)
    try {
      const cart = await orderApi.getUserCart(userId)
      console.log('Cart response from API:', cart)
      console.log('Cart items:', cart?.items)
      console.log('Cart structure:', Object.keys(cart || {}))
      setServerCart(cart)
    } catch (err) {
      console.error('Failed to load cart:', err)
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Load cart from API
  useEffect(() => {
    loadCart()
  }, [userId, loadCart])

  // Load products for server cart items
  useEffect(() => {
    let cancelled = false

    const loadProducts = async () => {
      if (!serverCart?.orderItems?.length) {
        setProductCache({})
        return
      }

      try {
        const cache: Record<number, any> = {}
        
        await Promise.all(
          serverCart.orderItems.map(async (item: any) => {
            if (cache[item.itemId]) return
            try {
              const isRoom = item.type === CART_ITEM_TYPE_ROOM
              const data = isRoom 
                ? await roomApi.getById(item.itemId)
                : await productApi.getById(item.itemId)
              cache[item.itemId] = data
            } catch (err) {
              console.error(`Failed to load item ${item.itemId}:`, err)
              cache[item.itemId] = null
            }
          })
        )

        if (!cancelled) {
          setProductCache(cache)
        }
      } catch (err) {
        console.error('Failed to load products:', err)
        if (!cancelled) {
          setProductCache({})
        }
      }
    }

    void loadProducts()

    return () => {
      cancelled = true
    }
  }, [serverCart])

  const handleRemoveItem = useCallback(
    async (orderItemId: number) => {
      try {
        await orderApi.removeFromCart(orderItemId)
        await loadCart()
      } catch (err) {
        console.error('Failed to remove item from cart:', err)
        setError('Не удалось удалить товар из корзины')
      }
    },
    [loadCart]
  )

  const handleUpdateQuantity = useCallback(
    async (orderItemId: number, newQuantity: number) => {
      if (newQuantity <= 0) {
        await handleRemoveItem(orderItemId)
        return
      }

      try {
        await orderApi.updateCartItemQuantity(orderItemId, newQuantity)
        await loadCart()
      } catch (err) {
        console.error('Failed to update item quantity:', err)
        setError('Не удалось обновить количество товара')
      }
    },
    [handleRemoveItem, loadCart]
  )

  const handleCheckoutClick = useCallback(() => {
    setShowPaymentModal(true)
  }, [])

  const handlePaymentSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!Number.isFinite(userId)) return

      setIsCheckingOut(true)
      setError(null)
      try {
        await orderApi.checkout(userId)
        setShowPaymentModal(false)
        setCardData({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' })
        await loadCart()
        onCheckout()
        alert('Заказ успешно оформлен!')
      } catch (err) {
        console.error('Failed to checkout:', err)
        setError('Не удалось обработать платёж. Попробуйте ещё раз.')
      } finally {
        setIsCheckingOut(false)
      }
    },
    [userId, loadCart, onCheckout]
  )



  const cartItems_display = useMemo(() => {
    if (!serverCart?.orderItems?.length) {
      return []
    }

    return serverCart.orderItems.map((item: any) => {
      const product = productCache[item.itemId]
      return {
        orderItemId: item.id,
        quantity: item.quantity,
        price: item.priceAtPurchase,
        product: product || null,
      }
    })
  }, [serverCart, productCache])

  const total = useMemo(() => {
    return cartItems_display.reduce((sum: number, item: any) => {
      return sum + (item.price || 0) * item.quantity
    }, 0)
  }, [cartItems_display])

  return (
    <section className="cart">
      <div className="container">
        <h1>🛒 Корзина</h1>
        
        {error && <div style={{ color: '#ff5b5b', marginBottom: '1rem' }}>{error}</div>}

        {isLoading ? (
          <div className="empty-cart">
            <p className="empty-emoji">⏳</p>
            <p className="empty-title">Загружаем корзину</p>
            <p className="empty-hint">Получаем состояние корзины с сервера</p>
          </div>
        ) : !serverCart?.orderItems?.length ? (
          <div className="empty-cart">
            <p className="empty-emoji">🛍️</p>
            <p className="empty-title">Корзина пуста</p>
            <p className="empty-hint">Добавьте товары из каталога или гид по городу</p>
            <Link to="/catalog" className="btn-back">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-items">
              <div className="items-header">
                <span>Товар</span>
                <span>Кол-во</span>
                <span>Цена</span>
                <span>Итого</span>
                <span></span>
              </div>
              {cartItems_display.map(({ orderItemId, quantity, price, product }: any) => {
                if (!product) return null
                
                const image = (product.image as string) || (product.images?.[0] as string) || 'https://via.placeholder.com/150'
                const title = (product.title as string) || (product.name as string) || 'Неизвестный товар'
                const category = (product.category as string) || 'Услуга'

                return (
                  <div key={orderItemId} className="cart-item">
                    <div className="item-info">
                      <img src={image} alt={title} className="item-img" />
                      <div className="item-details">
                        <h3>{title}</h3>
                        <p className="item-category">{category}</p>
                      </div>
                    </div>
                    <div className="item-count">
                      <button
                        className="btn-qty-decrease"
                        onClick={() => handleUpdateQuantity(orderItemId, quantity - 1)}
                        title="Уменьшить количество"
                      >
                        −
                      </button>
                      <span className="qty-value">{quantity}</span>
                      <button
                        className="btn-qty-increase"
                        onClick={() => handleUpdateQuantity(orderItemId, quantity + 1)}
                        title="Увеличить количество"
                      >
                        +
                      </button>
                    </div>
                    <div className="item-price">{price.toLocaleString('de-DE')} €</div>
                    <div className="item-total">{(price * quantity).toLocaleString('de-DE')} €</div>
                    <div className="item-actions">
                      <button
                        className="btn-remove-one"
                        onClick={() => handleRemoveItem(orderItemId)}
                        title="Удалить товар"
                      >
                        −
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="cart-summary">
              <h2>Итог</h2>
              <div className="summary-row">
                <span>Товаров:</span>
                <span>{cartItems_display.reduce((sum: number, item: any) => sum + item.quantity, 0)}</span>
              </div>
              <div className="summary-row">
                <span>Уникальных:</span>
                <span>{cartItems_display.length}</span>
              </div>
              <div className="summary-total">
                <span>Сумма:</span>
                <span className="total-amount">{total.toLocaleString('de-DE')} €</span>
              </div>
              <button className="btn-checkout" onClick={handleCheckoutClick}>Оплатить</button>
              <Link to="/catalog" className="btn-continue">
                Продолжить покупки
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
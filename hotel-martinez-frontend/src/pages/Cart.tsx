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

  // Tab switching state
  const [activeTab, setActiveTab] = useState<'cart' | 'history'>('cart')

  // Order History State
  const [orderHistory, setOrderHistory] = useState<any[]>([])
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false)
  const [orderHistoryError, setOrderHistoryError] = useState<string | null>(null)
  const [orderHistoryProductCache, setOrderHistoryProductCache] = useState<Record<string, any>>({})

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

  const loadOrderHistory = useCallback(async () => {
    if (!Number.isFinite(userId)) return
    setOrderHistoryLoading(true)
    setOrderHistoryError(null)
    try {
      const history = await orderApi.getOrderHistory(userId)
      setOrderHistory(history)
    } catch (err) {
      console.error('Failed to load order history:', err)
      setOrderHistoryError('Не удалось загрузить историю заказов')
    } finally {
      setOrderHistoryLoading(false)
    }
  }, [userId])

  // Load cart from API
  useEffect(() => {
    loadCart()
  }, [userId, loadCart])

  // Load order history from API
  useEffect(() => {
    loadOrderHistory()
  }, [userId, loadOrderHistory])

  // Load product details for order history items
  useEffect(() => {
    let cancelled = false

    const loadHistoryProducts = async () => {
      if (!orderHistory?.length) {
        setOrderHistoryProductCache({})
        return
      }

      const cacheKey = (type: number, itemId: number) => `${type}-${itemId}`

      try {
        const cache: Record<string, any> = {}

        await Promise.all(
          orderHistory.flatMap((order: any) =>
            (order.orderItems || []).map(async (item: any) => {
              const key = cacheKey(item.type, item.itemId)
              if (cache[key]) return
              try {
                const isRoom = item.type === CART_ITEM_TYPE_ROOM
                const data = isRoom
                  ? await roomApi.getById(item.itemId)
                  : await productApi.getById(item.itemId)
                cache[key] = data
              } catch (err) {
                console.error(`Failed to load history item ${item.itemId}:`, err)
                cache[key] = null
              }
            })
          )
        )

        if (!cancelled) {
          setOrderHistoryProductCache(cache)
        }
      } catch (err) {
        console.error('Failed to load history products:', err)
        if (!cancelled) {
          setOrderHistoryProductCache({})
        }
      }
    }

    void loadHistoryProducts()

    return () => {
      cancelled = true
    }
  }, [orderHistory])

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

  const [validationError, setValidationError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const validateCardData = useCallback((): string | null => {
    const rawNumber = cardData.cardNumber.replace(/\s/g, '')
    if (rawNumber.length !== 16) return 'Номер карты должен содержать 16 цифр'
    if (!cardData.cardHolder.trim()) return 'Укажите держателя карты'
    const month = parseInt(cardData.expiryMonth, 10)
    if (!month || month < 1 || month > 12) return 'Укажите корректный месяц (01-12)'
    const year = parseInt(cardData.expiryYear, 10)
    if (!year || year < 25 || year > 35) return 'Укажите корректный год (YY)'
    if (cardData.cvv.length !== 3) return 'CVV должен содержать 3 цифры'
    return null
  }, [cardData])

  const handlePaymentSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!Number.isFinite(userId)) return

      const validationErr = validateCardData()
      if (validationErr) {
        setValidationError(validationErr)
        return
      }

      setIsCheckingOut(true)
      setError(null)
      setValidationError(null)
      try {
        const result = await orderApi.checkout(userId)
        if (result.isSuccess) {
          setShowPaymentModal(false)
          setCardData({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' })
          setServerCart({ orderItems: [] })
          setProductCache({})
          onCheckout()
          void loadCart()
          setShowSuccessModal(true)
          void loadOrderHistory()
        } else {
          setError(result.message || 'Не удалось обработать платёж. Попробуйте ещё раз.')
        }
      } catch (err) {
        console.error('Failed to checkout:', err)
        setError('Не удалось обработать платёж. Попробуйте ещё раз.')
      } finally {
        setIsCheckingOut(false)
      }
    },
    [userId, loadCart, onCheckout, validateCardData, loadOrderHistory]
  )

  const handleCardDataChange = useCallback(
    (field: string, value: string) => {
      setCardData(prev => ({ ...prev, [field]: value }))
      setValidationError(null)
    },
    []
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


  const getOrderItemName = useCallback(
    (type: number, itemId: number): string => {
      const key = `${type}-${itemId}`
      const product = orderHistoryProductCache[key]
      if (!product) {
        if (type === CART_ITEM_TYPE_ROOM) return 'Номер'
        return 'Товар'
      }
      return (product.title as string) || (product.name as string) || (type === CART_ITEM_TYPE_ROOM ? 'Номер' : 'Товар')
    },
    [orderHistoryProductCache]
  )

  const getOrderItemImage = useCallback(
    (type: number, itemId: number): string => {
      const key = `${type}-${itemId}`
      const product = orderHistoryProductCache[key]
      if (!product) return 'https://via.placeholder.com/60'
      return (product.image as string) || (product.images?.[0] as string) || 'https://via.placeholder.com/60'
    },
    [orderHistoryProductCache]
  )

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0: return '🕐 В обработке'
      case 1: return '✅ Завершён'
      case 2: return '❌ Отменён'
      default: return `Статус: ${status}`
    }
  }

  const getItemTypeLabel = (type: number): string => {
    return type === CART_ITEM_TYPE_ROOM ? '🏨 Номер' : '🛍️ Товар'
  }

  const cartItemCount = serverCart?.orderItems?.length || 0

  return (
    <section className="cart">
      <div className="container">
        <div className="cart-tabs">
          <button
            className={`cart-tab ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            🛒 Корзина {cartItemCount > 0 && <span className="cart-tab-badge">{cartItemCount}</span>}
          </button>
          <button
            className={`cart-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 История заказов {orderHistory.length > 0 && <span className="cart-tab-badge">{orderHistory.length}</span>}
          </button>
        </div>

        {activeTab === 'cart' && (
          <>
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
                  Перейти в Каталог
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
          </>
        )}

        {activeTab === 'history' && (
          <>
            {orderHistoryLoading ? (
              <div className="empty-cart" style={{ minHeight: '300px' }}>
                <p className="empty-emoji">⏳</p>
                <p className="empty-title">Загружаем историю</p>
                <p className="empty-hint">Получаем список ваших заказов с сервера</p>
              </div>
            ) : orderHistoryError ? (
              <div className="empty-cart" style={{ minHeight: '300px' }}>
                <p className="empty-emoji">⚠️</p>
                <p className="empty-title">Ошибка загрузки</p>
                <p className="empty-hint">{orderHistoryError}</p>
              </div>
            ) : !orderHistory?.length ? (
              <div className="empty-cart" style={{ minHeight: '300px' }}>
                <p className="empty-emoji">📭</p>
                <p className="empty-title">История заказов пуста</p>
                <p className="empty-hint">Совершите первую покупку, и она появится здесь</p>
              </div>
            ) : (
              <div className="order-history-list">
                {orderHistory.map((order: any) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div className="order-card-header-left">
                        <span className="order-id">Заказ #{order.id}</span>
                        <span className="order-date">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="order-card-header-right">
                        <span className="order-status">{getStatusLabel(order.status)}</span>
                        <span className="order-total">{order.totalSum.toLocaleString('de-DE')} €</span>
                      </div>
                    </div>

                    {order.orderItems?.length > 0 ? (
                      <div className="order-items">
                        {order.orderItems.map((item: any) => (
                          <div key={item.id} className="order-item">
                            <img
                              src={getOrderItemImage(item.type, item.itemId)}
                              alt={getOrderItemName(item.type, item.itemId)}
                              className="order-item-img"
                            />
                            <div className="order-item-info">
                              <span className="order-item-name">
                                {getOrderItemName(item.type, item.itemId)}
                              </span>
                              <span className="order-item-type">{getItemTypeLabel(item.type)}</span>
                            </div>
                            <div className="order-item-qty">×{item.quantity}</div>
                            <div className="order-item-price">{item.priceAtPurchase.toLocaleString('de-DE')} €</div>
                            <div className="order-item-total">
                              {(item.priceAtPurchase * item.quantity).toLocaleString('de-DE')} €
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="order-items-empty">
                        <span>Состав заказа не указан</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={() => { if (!isCheckingOut) setShowPaymentModal(false) }}>
            <div className="payment-modal" onClick={e => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
                disabled={isCheckingOut}
              >
                ✕
              </button>
              <h2>💳 Оплата заказа</h2>
              <p className="payment-summary">Сумма к оплате: <strong>{total.toLocaleString('de-DE')} €</strong></p>
              
              {validationError && <div className="payment-error">{validationError}</div>}
              {error && <div className="payment-error">{error}</div>}

              <form onSubmit={handlePaymentSubmit} className="payment-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Номер карты</label>
                  <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardData.cardNumber}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '')
                      const formatted = raw.replace(/(.{4})/g, '$1 ').trim()
                      handleCardDataChange('cardNumber', formatted)
                    }}
                    required
                    disabled={isCheckingOut}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardHolder">Держатель карты</label>
                  <input
                    id="cardHolder"
                    type="text"
                    placeholder="IVAN IVANOV"
                    value={cardData.cardHolder}
                    onChange={e => handleCardDataChange('cardHolder', e.target.value.toUpperCase())}
                    required
                    disabled={isCheckingOut}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryMonth">Месяц</label>
                    <input
                      id="expiryMonth"
                      type="text"
                      inputMode="numeric"
                      placeholder="MM"
                      maxLength={2}
                      value={cardData.expiryMonth}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                        handleCardDataChange('expiryMonth', val)
                      }}
                      required
                      disabled={isCheckingOut}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="expiryYear">Год</label>
                    <input
                      id="expiryYear"
                      type="text"
                      inputMode="numeric"
                      placeholder="YY"
                      maxLength={2}
                      value={cardData.expiryYear}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                        handleCardDataChange('expiryYear', val)
                      }}
                      required
                      disabled={isCheckingOut}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      id="cvv"
                      type="text"
                      inputMode="numeric"
                      placeholder="123"
                      maxLength={3}
                      value={cardData.cvv}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 3)
                        handleCardDataChange('cvv', val)
                      }}
                      required
                      disabled={isCheckingOut}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-pay"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? '⏳ Обработка...' : `Оплатить ${total.toLocaleString('de-DE')} €`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="success-modal">
              <div className="success-icon">✅</div>
              <h2>Оплата успешно произведена!</h2>
              <p>Ваш заказ оформлен. Корзина очищена.</p>
              <button
                className="btn-pay"
                onClick={() => setShowSuccessModal(false)}
                style={{ marginTop: 0 }}
              >
                Хорошо
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
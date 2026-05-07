import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { CartItem } from '../types/cart'
import '../styles/cart.css'

type Props = {
  cartItems: CartItem[]
  onRemoveFromCart: (item: CartItem) => void
  onCheckout: () => void
}

export default function Cart({ cartItems, onRemoveFromCart, onCheckout }: Props) {
  const uniqueItems = useMemo(() => {
    const countMap = new Map<string, { item: CartItem; count: number; product: any }>()
    cartItems.forEach((cartItem) => {
      try {
        const key = `${cartItem.type}-${cartItem.id}`
        const itemData = cartItem.item as any
        if (countMap.has(key)) {
          const existing = countMap.get(key)!
          existing.count += 1
        } else {
          countMap.set(key, { item: cartItem, count: 1, product: itemData })
        }
      } catch {}
    })
    return Array.from(countMap.values())
  }, [cartItems])

  const total = useMemo(() => {
    return uniqueItems.reduce((sum, { product, count }) => {
      const price = (product?.price as number) || 0
      return sum + price * count
    }, 0)
  }, [uniqueItems])

  return (
    <section className="cart">
      <div className="container">
        <h1>🛒 Корзина</h1>

        {cartItems.length === 0 ? (
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
              {uniqueItems.map(({ item, count, product }) => {
                if (!product) return null
                
                const image = (product.image as string) || (product.images?.[0] as string) || 'https://via.placeholder.com/150'
                const title = (product.title as string) || (product.name as string) || 'Неизвестный товар'
                const category = (product.category as string) || 'Услуга'
                const price = (product.price as number) || 0
                const isAttraction = item.type === 'attraction'

                return (
                  <div key={`${item.type}-${item.id}`} className="cart-item">
                    <div className="item-info">
                      <img src={image} alt={title} className="item-img" />
                      <div className="item-details">
                        <h3>{title}</h3>
                        <p className="item-category">{category}</p>
                        {isAttraction && <p className="item-type">📍 Из гида по городу</p>}
                      </div>
                    </div>
                    <div className="item-count">{count}</div>
                    <div className="item-price">{price.toLocaleString('de-DE')} €</div>
                    <div className="item-total">{(price * count).toLocaleString('de-DE')} €</div>
                    <div className="item-actions">
                      <button
                        className="btn-remove-one"
                        onClick={() => onRemoveFromCart(item)}
                        title={`Удалить одну единицу${isAttraction ? ' (достопримечательность)' : ''}`}
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
                <span>{cartItems.length}</span>
              </div>
              <div className="summary-row">
                <span>Уникальных:</span>
                <span>{uniqueItems.length}</span>
              </div>
              <div className="summary-total">
                <span>Сумма:</span>
                <span className="total-amount">{total.toLocaleString('de-DE')} €</span>
              </div>
              <button className="btn-checkout" onClick={onCheckout}>Оплатить</button>
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
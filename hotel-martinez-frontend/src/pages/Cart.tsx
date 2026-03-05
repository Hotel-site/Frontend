import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import '../styles/cart.css'

type Props = {
  cartItems: number[]
  onRemoveFromCart: (id: number) => void
}

export default function Cart({ cartItems, onRemoveFromCart }: Props) {
  const cartProducts = useMemo(() => {
    return cartItems.map((id) => products.find((p) => p.id === id)).filter(Boolean)
  }, [cartItems])

  const total = useMemo(() => {
    return cartProducts.reduce((sum, p) => sum + (p?.price || 0), 0)
  }, [cartProducts])

  const uniqueProducts = useMemo(() => {
    return Array.from(new Set(cartItems)).map((id) => {
      const product = products.find((p) => p.id === id)
      const count = cartItems.filter((item) => item === id).length
      return { product, count }
    })
  }, [cartItems])

  return (
    <section className="cart">
      <div className="container">
        <h1>🛒 Корзина</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p className="empty-emoji">🛍️</p>
            <p className="empty-title">Корзина пуста</p>
            <p className="empty-hint">Добавьте товары из каталога</p>
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
              {uniqueProducts.map(({ product, count }) => (
                product && (
                  <div key={product.id} className="cart-item">
                    <div className="item-info">
                      <img src={product.image} alt={product.title} className="item-img" />
                      <div className="item-details">
                        <h3>{product.title}</h3>
                        <p className="item-category">{product.category}</p>
                      </div>
                    </div>
                    <div className="item-count">{count}</div>
                    <div className="item-price">{product.price.toLocaleString('de-DE')} €</div>
                    <div className="item-total">{(product.price * count).toLocaleString('de-DE')} €</div>
                    <button
                      className="btn-remove"
                      onClick={() => onRemoveFromCart(product.id)}
                      title="Удалить из корзины"
                    >
                      ✕
                    </button>
                  </div>
                )
              ))}
            </div>

            <div className="cart-summary">
              <h2>Итог</h2>
              <div className="summary-row">
                <span>Товаров:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="summary-row">
                <span>Уникальных:</span>
                <span>{uniqueProducts.length}</span>
              </div>
              <div className="summary-total">
                <span>Сумма:</span>
                <span className="total-amount">{total.toLocaleString('de-DE')} €</span>
              </div>
              <button className="btn-checkout">Оформить заказ</button>
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

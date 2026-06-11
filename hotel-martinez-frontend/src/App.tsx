import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ErrorState from './components/ErrorState/ErrorState'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Catalog from './pages/Catalog'
import Favorites from './pages/Favorites'
import Cart from './pages/Cart'
import About from './pages/About'
import Restaurant from './pages/Restaurant'
import Rooms from './pages/Rooms'
import LocalPage from './pages/LocalPage'
import Admin from './pages/Admin'
import PageErrorBoundary from './components/PageErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { favoriteApi, orderApi } from './api'
import type { CartItem, BookingData } from './types/cart'
import type { Product } from './types/product'
import './styles/app.css'

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

type FavoriteProductRecord = {
  productId: number
  favoriteId: number
}

const PRODUCT_ENTITY_TYPE = 1

// Backend enum: OrderItemType { Product = 0, Room = 1 }
const CART_ITEM_TYPE_PRODUCT = 0

function AppShell() {
  const { user } = useAuth()
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProductRecord[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const favoriteIds = useMemo(() => favoriteProducts.map((item) => item.productId), [favoriteProducts])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    let cancelled = false

    const loadFavorites = async () => {
      const userId = user?.id ? Number(user.id) : NaN

      if (!Number.isFinite(userId)) {
        setFavoriteProducts([])
        return
      }

      try {
        const apiFavorites = await favoriteApi.getUserFavorites(userId)
        if (cancelled) return

        const productFavorites = apiFavorites.filter((favorite) => favorite.entityType === PRODUCT_ENTITY_TYPE)
        const records = productFavorites.map((favorite) => ({
          productId: favorite.entityId,
          favoriteId: favorite.id,
        }))

        setFavoriteProducts(records)
      } catch (error) {
        console.error('Failed to load product favorites:', error)
        if (!cancelled) {
          setFavoriteProducts([])
        }
      }
    }

    void loadFavorites()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const onToggleFavorite = useCallback(
    async (id: number) => {
      if (!user?.id) {
        alert('Необходимо авторизоваться, чтобы добавить в избранное')
        return
      }

      const userId = Number(user.id)
      if (!Number.isFinite(userId)) return

      const existing = favoriteProducts.find((item) => item.productId === id)

      try {
        if (existing) {
          await favoriteApi.removeFavorite(existing.favoriteId)
          setFavoriteProducts((prev) => prev.filter((item) => item.productId !== id))
        } else {
          const created = await favoriteApi.addFavorite({
            userId,
            entityType: PRODUCT_ENTITY_TYPE,
            entityId: id,
          })
          setFavoriteProducts((prev) => [...prev, { productId: id, favoriteId: created.id }])
        }
      } catch (error) {
        console.error('Failed to update product favorite:', error)
      }
    },
    [favoriteProducts, user?.id]
  )

  // Product without booking → immediately POST with type=0
  const onAddToCart = async (product: Product) => {
    const userId = user?.id ? Number(user.id) : NaN
    if (!Number.isFinite(userId)) {
      alert('Необходимо авторизоваться, чтобы добавить товар в корзину')
      throw new Error('Пользователь не авторизован')
    }

    const item: CartItem = { type: 'product', id: product.id, item: product }
    setCart((prev) => [...prev, item])

    try {
      await orderApi.addToCart(
        userId,
        {
          id: 0,
          orderId: 0,
          type: CART_ITEM_TYPE_PRODUCT,
          itemId: product.id,
          quantity: 1,
          priceAtPurchase: product.price,
          createdAt: new Date().toISOString(),
        },
        product.price
      )
    } catch (err) {
      console.error('Failed to add item to cart on server:', err)
    }
  }

  // Service/Room with booking → fill form → submit → POST with type + bookingData
  const onAddBookingToCart = async (product: Product, bookingData: BookingData, itemType: number = CART_ITEM_TYPE_PRODUCT) => {
    const userId = user?.id ? Number(user.id) : NaN
    if (!Number.isFinite(userId)) {
      alert('Необходимо авторизоваться, чтобы забронировать')
      throw new Error('Пользователь не авторизован')
    }

    const item: CartItem = { 
      type: 'booking', 
      id: `booking-${product.id}-${Date.now()}`, 
      item: product,
      bookingData
    }
    setCart((prev) => [...prev, item])

    try {
      await orderApi.addToCart(
        userId,
        {
          id: 0,
          orderId: 0,
          type: itemType,
          itemId: product.id,
          quantity: 1,
          priceAtPurchase: product.price,
          createdAt: new Date().toISOString(),
        },
        product.price,
        bookingData
      )
    } catch (err) {
      console.error('Failed to add booking to cart on server:', err)
    }
  }
  
  const onCheckout = () => {
    setCart([])
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <main className="app-main">
          <PageErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/catalog" element={<Catalog favorites={favoriteIds} onToggleFavorite={onToggleFavorite} onAddToCart={onAddToCart} onAddBookingToCart={onAddBookingToCart} />} />
              <Route path="/favorites" element={<Favorites favorites={favoriteIds} onToggleFavorite={onToggleFavorite} />} />
              <Route path="/cart" element={<Cart onCheckout={onCheckout} />} />
              <Route path="/about" element={<About />} />
              <Route path="/restaurant" element={<Restaurant />} />
              <Route path="/rooms" element={<Rooms onAddBookingToCart={onAddBookingToCart} />} />
              <Route path="/attractions" element={<LocalPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route
                path="*"
                element={<ErrorState imageUrl="/cry.gif" title="Страница не найдена" message="Путь указан неверно. Проверьте адрес и попробуйте снова." />}
              />
            </Routes>
          </PageErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
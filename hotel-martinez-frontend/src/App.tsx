import { useEffect, useState } from 'react'
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
import type { CartItem, BookingData } from './types/cart'
import type { Product } from './types/product'
import { products } from './data/products'
import './styles/app.css'

export default function App() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const onToggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const onAddToCart = (id: number) => {
    const product = products.find((p) => p.id === id)
    if (product) {
      const item: CartItem = { type: 'product', id, item: product }
      setCart((prev) => [...prev, item])
    }
  }

  const onAddBookingToCart = (product: Product, bookingData: BookingData) => {
    const item: CartItem = { 
      type: 'booking', 
      id: `booking-${product.id}-${Date.now()}`, 
      item: product,
      bookingData
    }
    setCart((prev) => [...prev, item])
  }

  const onRemoveFromCart = (itemToRemove: CartItem) => {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.type === itemToRemove.type && item.id === itemToRemove.id)
      if (index > -1) {
        return prev.filter((_, i) => i !== index)
      }
      return prev
    })
  }

  const onCheckout = () => {
    alert('Спасибо за ваш заказ! Оплата успешно произведена.')
    setCart([])
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          <main className="app-main">
            <PageErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/catalog" element={<Catalog favorites={favorites} onToggleFavorite={onToggleFavorite} onAddToCart={onAddToCart} onAddBookingToCart={onAddBookingToCart} />} />
                <Route path="/favorites" element={<Favorites favorites={favorites} onToggleFavorite={onToggleFavorite} />} />
                <Route path="/cart" element={<Cart cartItems={cart} onRemoveFromCart={onRemoveFromCart} onCheckout={onCheckout} />} />
                <Route path="/about" element={<About />} />
                <Route path="/restaurant" element={<Restaurant />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/local" element={<LocalPage />} />
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
    </AuthProvider>
  )
}

import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Favorites from './pages/Favorites'
import Cart from './pages/Cart'
import About from './pages/About'
import Restaurant from './pages/Restaurant'
import './styles/app.css'

export default function App() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [cart, setCart] = useState<number[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const t = localStorage.getItem('theme')
    return t === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const onToggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const onAddToCart = (id: number) => {
    setCart((prev) => [...prev, id])
  }

  const onRemoveFromCart = (id: number) => {
    setCart((prev) => {
      const index = prev.indexOf(id)
      if (index > -1) {
        return prev.filter((_, i) => i !== index)
      }
      return prev
    })
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar favoritesCount={favorites.length} cartCount={cart.length} theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog favorites={favorites} onToggleFavorite={onToggleFavorite} onAddToCart={onAddToCart} />} />
            <Route path="/favorites" element={<Favorites favorites={favorites} onToggleFavorite={onToggleFavorite} />} />
            <Route path="/cart" element={<Cart cartItems={cart} onRemoveFromCart={onRemoveFromCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/restaurant" element={<Restaurant />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

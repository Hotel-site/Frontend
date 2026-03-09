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
import LocalPage from './pages/LocalPage'
import './styles/app.css'

const LOCAL_FAVORITES_KEY = 'local-favorites'

function readLocalFavoritesCount(): number {
  const raw = localStorage.getItem(LOCAL_FAVORITES_KEY)

  if (!raw) {
    return 0
  }

  try {
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

export default function App() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [localFavoritesCount, setLocalFavoritesCount] = useState<number>(() => readLocalFavoritesCount())
  const [cart, setCart] = useState<number[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const t = localStorage.getItem('theme')
    return t === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const sync = () => setLocalFavoritesCount(readLocalFavoritesCount())

    window.addEventListener('storage', sync)
    window.addEventListener('local-favorites-updated', sync)

    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('local-favorites-updated', sync)
    }
  }, [])

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
        <Navbar favoritesCount={favorites.length + localFavoritesCount} cartCount={cart.length} theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog favorites={favorites} onToggleFavorite={onToggleFavorite} onAddToCart={onAddToCart} />} />
            <Route path="/favorites" element={<Favorites favorites={favorites} onToggleFavorite={onToggleFavorite} />} />
            <Route path="/cart" element={<Cart cartItems={cart} onRemoveFromCart={onRemoveFromCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/restaurant" element={<Restaurant />} />
            <Route path="/local" element={<LocalPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import '../styles/navbar.css'

type Props = {
  favoritesCount: number
  cartCount: number
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Navbar({ favoritesCount, cartCount, theme, onToggleTheme }: Props) {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleAvatarClick = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <header className="navbar">
        <div className="brand">Hôtel Martinez</div>

        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Главная</NavLink>
          <NavLink to="/catalog" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Каталог</NavLink>
          <NavLink to="/restaurant" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Ресторан</NavLink>
          <NavLink to="/local" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Гид по городу</NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>О нас</NavLink>
        </nav>

        <div className="navbar-right">
          {isAuthenticated && user ? (
            <div className="user-menu" ref={menuRef}>
              <button 
                className="avatar-btn" 
                onClick={handleAvatarClick}
              >
                <img src={user.avatar} alt={user.name} className="user-avatar" />
              </button>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <div className="menu-header">{user.name}</div>
                  <NavLink to="/favorites" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                    ❤️ Избранное
                  </NavLink>
                  <NavLink to="/cart" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                    🛒 Корзина
                  </NavLink>
                  <NavLink to="/settings" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                    ⚙️ Настройки
                  </NavLink>
                  <div className="menu-divider"></div>
                  <button className="menu-item logout-item" onClick={handleLogout}>
                    Выход
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/auth" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Вход</NavLink>
          )}
          <button className="theme-btn" onClick={onToggleTheme} title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
    </header>
  )
}
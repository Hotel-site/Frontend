import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import '../styles/navbar.css'

type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Navbar({ theme, onToggleTheme }: Props) {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const avatarSrc = user
    ? (user.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`)
    : ''

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header className="navbar">
        <div className="brand">Hôtel Martinez</div>

        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Главная</NavLink>
          <NavLink to="/catalog" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Каталог</NavLink>
          <NavLink to="/restaurant" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Ресторан</NavLink>
          <NavLink to="/rooms" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Номера</NavLink>
          <NavLink to="/attractions" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Туризм</NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>О нас</NavLink>
        </nav>

        <div className="navbar-right">
          {isAuthenticated && user ? (
            <div className="user-menu" ref={menuRef}>
              <button
                className="avatar-btn"
                onClick={handleAvatarClick}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                aria-label="Открыть меню пользователя"
              >
                <img src={avatarSrc} alt={user.username} className="user-avatar" />
              </button>
              {isMenuOpen && (
                <div className="dropdown-menu" role="menu">
                  <div className="menu-header">
                    <img src={avatarSrc} alt="" className="menu-avatar" />
                    <div className="menu-meta">
                      <div className="menu-name">{user.username}</div>
                      <div className="menu-subtitle">{user.email}</div>
                    </div>
                  </div>

                  <NavLink
                    to="/favorites"
                    className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                  >
                    <span className="menu-icon" aria-hidden>
                      ❤️
                    </span>
                    <span className="menu-label">Избранное</span>
                  </NavLink>
                  <NavLink
                    to="/cart"
                    className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                  >
                    <span className="menu-icon" aria-hidden>
                      🛒
                    </span>
                    <span className="menu-label">Корзина</span>
                  </NavLink>

                  {user.role === 'admin' && (
                    <>
                      <div className="menu-divider" />
                      <NavLink
                        to="/admin"
                        className={({ isActive }) => `menu-item admin-item ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                        role="menuitem"
                      >
                        <span className="menu-icon" aria-hidden>
                          👑
                        </span>
                        <span className="menu-label">Администратор</span>
                      </NavLink>
                    </>
                  )}

                  <div className="menu-divider" />
                  <button className="menu-item logout-item" onClick={handleLogout} role="menuitem">
                    <span className="menu-icon" aria-hidden>
                      ⎋
                    </span>
                    <span className="menu-label">Выход</span>
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
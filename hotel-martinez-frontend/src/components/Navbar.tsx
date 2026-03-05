import { NavLink } from 'react-router-dom'
import '../styles/navbar.css'

type Props = {
  favoritesCount: number
  cartCount: number
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Navbar({ favoritesCount, cartCount, theme, onToggleTheme }: Props) {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <div className="brand">Hôtel Martinez</div>

        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Главная</NavLink>
          <NavLink to="/catalog" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>Каталог</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>
            Избранное <span className="badge">{favoritesCount}</span>
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>
            Корзина <span className="badge">{cartCount}</span>
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}>О нас</NavLink>
        </nav>
        <button className="theme-btn" onClick={onToggleTheme}>
          {theme === 'dark' ? '☀️ Светлая' : '🌙 Тёмная'}
        </button>
      </div>
    </header>
  )
}

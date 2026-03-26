import type { RouteObject } from 'react-router-dom'
import About from './pages/About'
import Auth from './pages/Auth'
import Cart from './pages/Cart'
import Catalog from './pages/Catalog'
import Favorites from './pages/Favorites'
import Home from './pages/Home'
import LocalPage from './pages/LocalPage'
import Restaurant from './pages/Restaurant'
import Rooms from './pages/Rooms'

//END-points ued Navbar 
export const appRoutes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/auth', element: <Auth /> },
  { path: '/catalog', element: <Catalog favorites={[]} onToggleFavorite={() => undefined} onAddToCart={() => undefined} /> },
  { path: '/favorites', element: <Favorites favorites={[]} onToggleFavorite={() => undefined} /> },
  { path: '/cart', element: <Cart cartItems={[]} onRemoveFromCart={() => undefined} /> },
  { path: '/about', element: <About /> },
  { path: '/restaurant', element: <Restaurant /> },
  { path: '/rooms', element: <Rooms /> },
  { path: '/local', element: <LocalPage /> },
]

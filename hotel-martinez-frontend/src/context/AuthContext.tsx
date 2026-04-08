import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Загрузка пользователя при монтировании
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!email || !password) {
        throw new Error('Заполните все поля')
      }

      if (!email.includes('@')) {
        throw new Error('Введите валидный email')
      }

      const role: UserRole = email === 'admin@hotel.com' ? 'admin' : 'user'
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        role: email.toLowerCase() === 'admin@hotel-martinez.com' ? 'admin' : 'user',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role,
      }

      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!name || !email || !password) {
        throw new Error('Заполните все поля')
      }

      if (!email.includes('@')) {
        throw new Error('Введите валидный email')
      }

      if (password.length < 6) {
        throw new Error('Пароль должен быть не менее 6 символов')
      }

      const role: UserRole = email === 'admin@hotel.com' ? 'admin' : 'user'
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: email.toLowerCase() === 'admin@hotel-martinez.com' ? 'admin' : 'user',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role,
      }

      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен быть использован внутри AuthProvider')
  }
  return context
}

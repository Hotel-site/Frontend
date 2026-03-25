import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
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

const STORAGE_KEY = 'auth-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Загрузка пользователя при монтировании
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
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

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
      setUser(newUser)
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

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
      setUser(newUser)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
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

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/authApi'

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  role?: UserRole
}

type JwtPayload = Record<string, unknown>

function base64UrlToUint8Array(input: string) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const bytes = base64UrlToUint8Array(parts[1])
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function pickStringClaim(payload: JwtPayload | null, keys: string[]) {
  if (!payload) return undefined
  for (const key of keys) {
    const v = payload[key]
    if (typeof v === 'string' && v.trim()) return v
    if (Array.isArray(v) && typeof v[0] === 'string' && v[0].trim()) return v[0]
  }
  return undefined
}

function normalizeRole(role?: string): UserRole | undefined {
  if (!role) return undefined
  const r = role.toLowerCase()
  if (r.includes('admin')) return 'admin'
  if (r.includes('user')) return 'user'
  return undefined
}

type AuthLikeResponse = {
  id?: number | string
  email?: string
  username?: string
  token?: string
}

function deriveUserFromJwt(token: string, fallbackEmail: string, fallbackUsername?: string, response?: AuthLikeResponse): User {
  const payload = decodeJwt(token)

  const idFromJwt = pickStringClaim(payload, [
    'nameid',
    'sub',
    'userId',
    'id',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ])
  const emailFromJwt = pickStringClaim(payload, [
    'email',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  ])
  const usernameFromJwt = pickStringClaim(payload, [
    'unique_name',
    'username',
    'name',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  ])
  const role = normalizeRole(
    pickStringClaim(payload, [
      'role',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
    ])
  )

  const resolvedEmail = response?.email || emailFromJwt || fallbackEmail
  const resolvedUsername =
    response?.username || usernameFromJwt || fallbackUsername || resolvedEmail.split('@')[0]
  const resolvedId = (response?.id != null ? response.id.toString() : idFromJwt) || '0'

  return {
    id: resolvedId,
    email: resolvedEmail,
    username: resolvedUsername,
    role,
    avatar: resolvedEmail
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(resolvedEmail)}`
      : undefined,
  }
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

  useEffect(() => {
    // Try to restore user from localStorage (or derive it from JWT)
    const restoreUser = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const savedUser = localStorage.getItem('user')

        // Never restore user without a token
        if (!token && savedUser) {
          localStorage.removeItem('user')
        }

        if (token && savedUser) {
          setUser(JSON.parse(savedUser))
          return
        }

        if (token) {
          const newUser = deriveUserFromJwt(token, '')
          if (newUser.id !== '0' || newUser.email || newUser.username) {
            setUser(newUser)
            localStorage.setItem('user', JSON.stringify(newUser))
          }
        }
      } catch (error) {
        console.error('Failed to restore user:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    restoreUser()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      if (!email || !password) {
        throw new Error('Заполните все поля')
      }

      if (!email.includes('@')) {
        throw new Error('Введите валидный email')
      }

      if (password.length < 8) {
        throw new Error('Пароль должен быть минимум 8 символов')
      }

      const response = await authApi.login({ email, password })

      const token = response.token ?? localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Бекенд не вернул JWT токен')
      }

      const newUser = deriveUserFromJwt(token, email, undefined, response)

      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      if (!name || !email || !password) {
        throw new Error('Заполните все поля')
      }

      if (!email.includes('@')) {
        throw new Error('Введите валидный email')
      }

      if (password.length < 8) {
        throw new Error('Пароль должен быть минимум 8 символов')
      }

      await authApi.register({
        username: name,
        email,
        password,
      })

      // Бек может не выдавать токен при регистрации — поэтому сразу логинимся и получаем JWT.
      const loginResponse = await authApi.login({ email, password })
      const token = loginResponse.token ?? localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Бекенд не вернул JWT токен после регистрации')
      }

      const newUser = deriveUserFromJwt(token, email, name, loginResponse)

      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authApi.logout()
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!localStorage.getItem('authToken'),
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

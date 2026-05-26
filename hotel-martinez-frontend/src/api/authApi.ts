import apiClient from './apiClient'

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  id: number | string
  email?: string
  username?: string
  token?: string
  isSuccess?: boolean
  message?: string
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data)
      const result = response.data

      if (result.token) {
        localStorage.setItem('authToken', result.token)
      }

      return result
    } catch (error: any) {
      const errorMessage = extractErrorMessage(
        error,
        'Ошибка при регистрации. Попробуйте позже.'
      )
      console.error('Registration error:', errorMessage, error.response?.data || error.message)
      throw new Error(errorMessage)
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data)
      const result = response.data

      if (result.token) {
        localStorage.setItem('authToken', result.token)
      }

      return result
    } catch (error: any) {
      const errorMessage = extractErrorMessage(
        error,
        'Ошибка при входе. Попробуйте позже.'
      )
      console.error('Login error:', errorMessage, error.response?.data || error.message)
      throw new Error(errorMessage)
    }
  },

  logout: () => {
    localStorage.removeItem('authToken')
  },
}

function extractErrorMessage(error: any, fallback: string): string {
  // Пробуем достать message из разных мест в ответе бека
  const data = error.response?.data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data && typeof data === 'object') {
    // Проверяем разные возможные поля с сообщением
    if (data.message && typeof data.message === 'string') {
      return data.message
    }
    if (data.error && typeof data.error === 'string') {
      return data.error
    }
    if (data.detail && typeof data.detail === 'string') {
      return data.detail
    }
    // Если есть массив ошибок (например, validation errors)
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0]
      if (typeof first === 'string') return first
      if (first.message) return first.message
    }
  }

  // Fallback на статус код, если есть
  if (error.response?.status) {
    const status = error.response.status
    if (status === 400) return 'Проверьте введённые данные'
    if (status === 401) return 'Неверный email или пароль'
    if (status === 403) return 'Доступ запрещён'
    if (status === 409) return 'Email уже зарегистрирован'
    if (status === 500) return 'Ошибка сервера. Попробуйте позже'
  }

  // Статус текст (e.g., "Unauthorized", "Bad Request")
  if (error.response?.statusText) {
    return error.response.statusText
  }

  return fallback
}
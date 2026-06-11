import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })

    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? ''
      const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register')
      const isOnAuthPage = window.location.pathname.startsWith('/auth')

      localStorage.removeItem('authToken')

      if (!isAuthRequest && !isOnAuthPage) {
        window.location.href = '/auth'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

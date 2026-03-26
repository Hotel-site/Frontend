import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { login, register, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError('Пароли не совпадают')
          return
        }
        if (password.length < 8) {
          setError('Пароль должен быть минимум 8 символов')
          return
        }
        if (!name.trim()) {
          setError('Введите имя')
          return
        }
        await register(name, email, password)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации')
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setError('')
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">
            {isRegister ? 'Создать аккаунт' : 'Вход в аккаунт'}
          </h1>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister && (
              <div className="auth-field">
                <label htmlFor="name" className="auth-label">
                  Имя:
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  disabled={isLoading}
                  className="auth-input"
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email:
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                disabled={isLoading}
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Пароль:
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="auth-input"
              />
            </div>

            {isRegister && (
              <div className="auth-field">
                <label htmlFor="confirmPassword" className="auth-label">
                  Подтвердить пароль:
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="auth-input"
                />
              </div>
            )}

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <p className="auth-text">
            {isRegister ? (
              <>
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="auth-link"
                >
                  Войдите
                </button>
              </>
            ) : (
              <>
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="auth-link"
                >
                  Зарегистрируйтесь
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

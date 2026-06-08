import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../api/userApi'
import '../styles/Auth.css'

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('')
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false)
  const [showRecoveryConfirmPassword, setShowRecoveryConfirmPassword] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)
  const { login, register, isLoading, user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

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
        if (!username.trim()) {
          setError('Введите имя пользователя')
          return
        }
        await register(username, email, password)
      } else {
        if (password.length < 8) {
          setError('Пароль должен быть минимум 8 символов')
          return
        }
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
    setSuccessMsg('')
    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!recoveryEmail.trim()) {
      setError('Введите email')
      return
    }
    if (!recoveryEmail.includes('@')) {
      setError('Введите валидный email')
      return
    }
    if (recoveryPassword.length < 8) {
      setError('Пароль должен быть минимум 8 символов')
      return
    }
    if (recoveryPassword !== recoveryConfirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setIsRecovering(true)
    try {
      const userId = user?.id ? Number(user.id) : 0
      const response = await userApi.recoverPassword(userId, {
        email: recoveryEmail,
        password: recoveryPassword,
      })
      if (response.isSuccess) {
        setSuccessMsg(response.message || 'Пароль успешно изменён!')
        setTimeout(() => {
          setIsRecoveryMode(false)
          setRecoveryEmail('')
          setRecoveryPassword('')
          setRecoveryConfirmPassword('')
          setSuccessMsg('')
        }, 3000)
      } else {
        setError(response.message || 'Ошибка при восстановлении пароля')
      }
    } catch (err) {
      // Extract actual backend message from axios error
      let msg: string

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        msg = axiosErr.response?.data?.message ?? 'Ошибка при восстановлении пароля'
      } else if (err instanceof Error) {
        msg = err.message
      } else {
        msg = 'Ошибка при восстановлении пароля'
      }

      if (msg.includes("User with this Email doesn't exist") || msg.includes("User with this Email doesn't exist!")) {
        setError('Пользователь с таким email не найден')
      } else {
        setError(msg)
      }
    } finally {
      setIsRecovering(false)
    }
  }

  const openRecovery = () => {
    setError('')
    setSuccessMsg('')
    setIsRecoveryMode(true)
  }

  const closeRecovery = () => {
    setIsRecoveryMode(false)
    setError('')
    setSuccessMsg('')
    setRecoveryEmail('')
    setRecoveryPassword('')
    setRecoveryConfirmPassword('')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {isRecoveryMode ? (
            <>
              <h1 className="auth-title">Восстановление пароля</h1>

              {error && <div className="auth-error">{error}</div>}
              {successMsg && <div className="auth-success">{successMsg}</div>}

              <form onSubmit={handleRecovery} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="recoveryEmail" className="auth-label">
                    Email:
                  </label>
                  <input
                    id="recoveryEmail"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="example@mail.com"
                    disabled={isRecovering}
                    className="auth-input"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="recoveryPassword" className="auth-label">
                    Новый пароль:
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="recoveryPassword"
                      type={showRecoveryPassword ? 'text' : 'password'}
                      value={recoveryPassword}
                      onChange={(e) => setRecoveryPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isRecovering}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
                      tabIndex={-1}
                    >
                      {showRecoveryPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="recoveryConfirmPassword" className="auth-label">
                    Подтвердить пароль:
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="recoveryConfirmPassword"
                      type={showRecoveryConfirmPassword ? 'text' : 'password'}
                      value={recoveryConfirmPassword}
                      onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isRecovering}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowRecoveryConfirmPassword(!showRecoveryConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showRecoveryConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isRecovering} className="auth-button">
                  {isRecovering ? 'Загрузка...' : 'Сменить пароль'}
                </button>
              </form>

              <p className="auth-text">
                <button
                  type="button"
                  onClick={closeRecovery}
                  className="auth-link"
                >
                  Вернуться к входу
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-title">
                {isRegister ? 'Создать аккаунт' : 'Вход в аккаунт'}
              </h1>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                {isRegister && (
                  <div className="auth-field">
                    <label htmlFor="username" className="auth-label">
                      Имя пользователя:
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
                  <div className="auth-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {!isRegister && (
                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={openRecovery}
                    >
                      Забыл пароль?
                    </button>
                  )}
                </div>

                {isRegister && (
                  <div className="auth-field">
                    <label htmlFor="confirmPassword" className="auth-label">
                      Подтвердить пароль:
                    </label>
                    <div className="auth-input-wrapper">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="auth-input"
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
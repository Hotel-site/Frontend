import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Props = {
  children: React.ReactNode
}

export default function AdminRoute({ children }: Props) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Загружаем...</div>
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import ErrorState from './ErrorState'

type BoundaryProps = {
  children: ReactNode
  resetKey: string
}

type BoundaryState = {
  hasError: boolean
}

class InnerPageErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page render error:', error, info)
  }

  componentDidUpdate(prevProps: BoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          emoji="(>_<)"
          title="Страница временно недоступна"
          message="Произошла ошибка при отрисовке. Перейдите на другую страницу или попробуйте снова."
        />
      )
    }

    return this.props.children
  }
}

type Props = {
  children: ReactNode
}

export default function PageErrorBoundary({ children }: Props) {
  const location = useLocation()

  return <InnerPageErrorBoundary resetKey={location.pathname}>{children}</InnerPageErrorBoundary>
}
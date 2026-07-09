import { useAppSelector } from '../../app/hooks'
import { LoginPage } from '../../pages/AuthPages/LoginPage'

export function ProtectedRoute({ children }) {
  const token = useAppSelector((state) => state.auth.token)

  if (!token) {
    return <LoginPage />
  }

  return children
}

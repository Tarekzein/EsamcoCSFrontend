import { useEffect, useState } from 'react'
import { StoreProvider } from '../app/store'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { ForgotPasswordPage } from '../pages/AuthPages/ForgotPasswordPage'
import { LoginPage } from '../pages/AuthPages/LoginPage'
import { ProtectedRoute } from '../Middlewares/AuthMiddleware/ProtectedRoute'
import { ResetPasswordPage } from '../pages/AuthPages/ResetPasswordPage'
import { VerifyPage } from '../pages/AuthPages/VerifyPage'

function getRoute() {
  return window.location.pathname.replace(/\/+$/, '') || '/login'
}

function RouterView() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    function handleRouteChange() {
      setRoute(getRoute())
    }

    window.addEventListener('popstate', handleRouteChange)

    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  if (route === '/' || route === '/login') {
    return <LoginPage />
  }

  if (route === '/forgot-password') {
    return <ForgotPasswordPage />
  }

  if (route === '/verify') {
    return <VerifyPage />
  }

  if (route === '/reset-password') {
    return <ResetPasswordPage />
  }

  if (route === '/dashboard') {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return <LoginPage />
}

export function AppRouter() {
  return (
    <StoreProvider>
      <RouterView />
    </StoreProvider>
  )
}

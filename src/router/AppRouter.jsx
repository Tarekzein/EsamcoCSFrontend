import { useEffect, useState } from 'react'
import { StoreProvider } from '../app/store'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { AuditLogsListPage } from '../pages/AuditLogsPages/AuditLogsListPage'
import { ForgotPasswordPage } from '../pages/AuthPages/ForgotPasswordPage'
import { LoginPage } from '../pages/AuthPages/LoginPage'
import { CustomersListPage } from '../pages/CustomersPages/CustomersListPage'
import { DepartmentsListPage } from '../pages/DepartmentsPages/DepartmentsListPage'
import { ProtectedRoute } from '../Middlewares/AuthMiddleware/ProtectedRoute'
import { DashboardPage } from '../pages/Dashboard/DashboardPage'
import { LiveChatPage } from '../pages/LiveChat/LiveChatPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ResetPasswordPage } from '../pages/AuthPages/ResetPasswordPage'
import { TicketsListPage } from '../pages/TicketsPages/TicketsListPage'
import { TicketSettingsPage } from '../pages/TicketSettingsPages/TicketSettingsPage'
import { UsersListPage } from '../pages/UsersPages/UsersListPage'
import { VerifyPage } from '../pages/AuthPages/VerifyPage'
import { SupportPage } from '../pages/SupportPages/SupportPage'
import { SupportTicketPage } from '../pages/SupportPages/SupportTicketPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { NAVIGATION_EVENT, NAV_ITEMS } from './navigation'

const ROUTE_PAGES = {
  '/dashboard': DashboardPage,
  '/live-chat': LiveChatPage,
  '/tickets': TicketsListPage,
  '/ticket-settings': TicketSettingsPage,
  '/users': UsersListPage,
  '/departments': DepartmentsListPage,
  '/customers': CustomersListPage,
  '/audit-logs': AuditLogsListPage,
}

function getRoute() {
  return window.location.pathname.replace(/\/+$/, '') || '/login'
}

function getLiveChatConversationId(path) {
  const match = path.match(/^\/live-chat\/(\d+)$/)
  return match ? Number(match[1]) : null
}

function getCustomerId(path) {
  const match = path.match(/^\/customers\/(\d+)$/)
  return match ? Number(match[1]) : null
}

function getTicketId(path) {
  const match = path.match(/^\/tickets\/(\d+)$/)
  return match ? Number(match[1]) : null
}

function getSupportTicketUuid(path) {
  const match = path.match(/^\/support\/tickets\/([0-9a-f-]+)$/i)
  return match ? match[1] : null
}

function RouterView() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    function handleRouteChange() {
      setRoute(getRoute())
    }

    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener(NAVIGATION_EVENT, handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener(NAVIGATION_EVENT, handleRouteChange)
    }
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

  if (route === '/support') {
    return <SupportPage />
  }

  const supportTicketUuid = getSupportTicketUuid(route)

  if (supportTicketUuid) {
    return <SupportTicketPage uuid={supportTicketUuid} />
  }

  const liveChatConversationId = getLiveChatConversationId(route)

  if (liveChatConversationId !== null) {
    return (
      <ProtectedRoute>
        <DashboardLayout currentPath="/live-chat" pageTitle="Live Chat">
          <LiveChatPage conversationIdFromUrl={liveChatConversationId} />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const ticketId = getTicketId(route)

  if (ticketId !== null) {
    return (
      <ProtectedRoute>
        <DashboardLayout currentPath="/tickets" pageTitle="Tickets">
          <TicketsListPage ticketIdFromUrl={ticketId} />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const customerId = getCustomerId(route)

  if (customerId !== null) {
    return (
      <ProtectedRoute>
        <DashboardLayout currentPath="/customers" pageTitle="Customers">
          <CustomersListPage customerIdFromUrl={customerId} />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const navItem = NAV_ITEMS.find((item) => item.path === route)

  if (navItem) {
    const Page = ROUTE_PAGES[route]

    return (
      <ProtectedRoute>
        <DashboardLayout currentPath={route} pageTitle={navItem.title}>
          {Page ? <Page /> : <PlaceholderPage title={navItem.label} />}
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return <NotFoundPage />
}

export function AppRouter() {
  return (
    <StoreProvider>
      <RouterView />
    </StoreProvider>
  )
}

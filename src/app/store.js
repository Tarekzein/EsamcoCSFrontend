import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { createElement } from 'react'
import { Provider } from 'react-redux'
import authReducer, {
  loadCurrentUser,
  logoutUser,
  loginUser,
  requestPasswordReset,
  submitNewPassword,
  toggleOnlineStatus,
  verifyOtp,
} from '../features/auth/authSlice'
import auditLogsReducer from '../features/auditLogs/auditLogsSlice'
import customersReducer from '../features/customers/customersSlice'
import dashboardsReducer from '../features/dashboards/dashboardsSlice'
import departmentsReducer from '../features/departments/departmentsSlice'
import liveChatReducer from '../features/liveChat/liveChatSlice'
import ticketSettingsReducer from '../features/tickets/ticketSettingsSlice'
import ticketsReducer from '../features/tickets/ticketsSlice'
import usersReducer from '../features/users/usersSlice'

const authPersistenceMiddleware = createListenerMiddleware()

authPersistenceMiddleware.startListening({
  matcher: isAnyOf(
    loginUser.fulfilled,
    loadCurrentUser.fulfilled,
    toggleOnlineStatus.fulfilled,
    logoutUser.fulfilled,
    requestPasswordReset.fulfilled,
    verifyOtp.fulfilled,
    submitNewPassword.fulfilled
  ),
  effect: (action, listenerApi) => {
    const { auth } = listenerApi.getState()

    if (loginUser.fulfilled.match(action)) {
      localStorage.setItem('auth_token', auth.token)
      localStorage.setItem('auth_user', JSON.stringify(auth.user))
    }

    if (loadCurrentUser.fulfilled.match(action) || toggleOnlineStatus.fulfilled.match(action)) {
      localStorage.setItem('auth_user', JSON.stringify(auth.user))
    }

    if (logoutUser.fulfilled.match(action)) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }

    if (requestPasswordReset.fulfilled.match(action)) {
      sessionStorage.setItem('reset_email', auth.resetEmail)
      sessionStorage.setItem('reset_otp_expires_at', String(auth.otpExpiresAt))
      sessionStorage.removeItem('reset_verified')
    }

    if (verifyOtp.fulfilled.match(action)) {
      sessionStorage.setItem('reset_verified', 'true')
    }

    if (submitNewPassword.fulfilled.match(action)) {
      sessionStorage.removeItem('reset_email')
      sessionStorage.removeItem('reset_verified')
      sessionStorage.removeItem('reset_otp_expires_at')
    }
  },
})

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboards: dashboardsReducer,
    liveChat: liveChatReducer,
    users: usersReducer,
    departments: departmentsReducer,
    auditLogs: auditLogsReducer,
    customers: customersReducer,
    tickets: ticketsReducer,
    ticketSettings: ticketSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(authPersistenceMiddleware.middleware),
})

export function StoreProvider({ children }) {
  return createElement(Provider, { store }, children)
}

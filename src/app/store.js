import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { createElement } from 'react'
import { Provider } from 'react-redux'
import authReducer, {
  loggedOut,
  loginUser,
  requestPasswordReset,
  submitNewPassword,
  verifyOtp,
} from '../features/auth/authSlice'

const authPersistenceMiddleware = createListenerMiddleware()

authPersistenceMiddleware.startListening({
  matcher: isAnyOf(
    loginUser.fulfilled,
    loggedOut,
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

    if (loggedOut.match(action)) {
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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(authPersistenceMiddleware.middleware),
})

export function StoreProvider({ children }) {
  return createElement(Provider, { store }, children)
}

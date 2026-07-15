import { request } from '../../lib/httpClient'

export function login({ login, password, remember }) {
  return request('/auth/login', {
    method: 'POST',
    body: {
      login,
      password,
      remember,
      device_name: navigator.userAgent || 'web',
    },
  })
}

export function forgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

export function verifyResetOtp(otp) {
  return request('/auth/verify-reset-otp', {
    method: 'POST',
    body: { otp },
  })
}

export function resetPassword({ password, passwordConfirmation }) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: {
      password,
      password_confirmation: passwordConfirmation,
    },
  })
}

export function fetchCurrentUser() {
  return request('/auth/me')
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}

export function updateOwnOnlineStatus(isOnline) {
  return request('/users/me/online-status', {
    method: 'PATCH',
    body: { is_online: isOnline },
  })
}

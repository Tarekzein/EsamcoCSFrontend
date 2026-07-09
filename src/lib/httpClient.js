const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getToken() {
  return localStorage.getItem('auth_token')
}

function getValidationMessage(payload, fallback) {
  const errors = payload?.errors

  if (!errors) {
    return payload?.message || fallback
  }

  const firstError = Object.values(errors).flat().find(Boolean)

  return firstError || payload?.message || fallback
}

export async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = await response.json().catch(() => null)

  if (!payload) {
    throw new Error('تعذر قراءة استجابة الخادم. يرجى التأكد من تشغيل واجهة Laravel الخلفية.')
  }

  if (!response.ok) {
    throw new Error(getValidationMessage(payload, 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'))
  }

  return payload
}

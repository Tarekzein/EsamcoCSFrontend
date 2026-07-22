export function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString('ar-EG')
}

export function formatDateOnly(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('ar-EG')
}

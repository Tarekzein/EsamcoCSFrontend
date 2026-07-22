export const CALL_STATUS_LABELS = {
  originating: 'جارٍ الاتصال',
  ringing: 'يرن',
  answered: 'تم الرد',
  completed: 'مكتملة',
  failed: 'فشلت',
  no_answer: 'بدون رد',
}

export const CALL_STATUS_BADGE = {
  originating: 'bg-amber-50 text-amber-700',
  ringing: 'bg-blue-50 text-blue-700',
  answered: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-brand-gray/8 text-brand-gray/70',
  failed: 'bg-red-50 text-red-700',
  no_answer: 'bg-brand-gray/8 text-brand-gray/60',
}

export const CALL_STATUS_DOT = {
  originating: 'bg-amber-400',
  ringing: 'bg-blue-400',
  answered: 'bg-emerald-400',
  completed: 'bg-brand-gray/30',
  failed: 'bg-red-400',
  no_answer: 'bg-brand-gray/30',
}

// Statuses that still have events coming (AMI hasn't reported a final
// hangup yet) - used by the list page to decide whether to keep polling
// for updates, since there's no websocket broadcast for call status yet.
export const ACTIVE_CALL_STATUSES = ['originating', 'ringing', 'answered']

export function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString('ar-EG')
}

export function formatDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return '—'

  const totalSeconds = Math.max(0, Math.round((new Date(endedAt) - new Date(startedAt)) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

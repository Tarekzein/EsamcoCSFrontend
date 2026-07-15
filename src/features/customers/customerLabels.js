export const SOURCE_LABELS = {
  manual: 'يدوي',
  live_chat: 'الدردشة المباشرة',
  chatbot: 'روبوت المحادثة',
  email: 'البريد الإلكتروني',
  phone: 'الهاتف',
  portal: 'البوابة',
  api: 'API',
}

export const SOURCE_OPTIONS = Object.entries(SOURCE_LABELS)

export const TICKET_STATUS_LABELS = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  pending_customer: 'بانتظار العميل',
  escalated: 'مصعّدة',
  resolved: 'محلولة',
  closed: 'مغلقة',
  reopened: 'أعيد فتحها',
}

export const OPEN_TICKET_STATUSES = ['open', 'in_progress', 'pending_customer', 'escalated', 'reopened']

export const CONVERSATION_STATUS_LABELS = {
  waiting: 'قيد الانتظار',
  assigned: 'معينة',
  active: 'نشطة',
  resolved: 'محلولة',
  closed: 'مغلقة',
}

export const PRIORITY_LABELS = {
  low: 'منخفضة',
  normal: 'عادية',
  high: 'مرتفعة',
  urgent: 'عاجلة',
}

export const PRIORITY_BADGE = {
  low: 'bg-brand-gray/8 text-brand-gray/70',
  normal: 'bg-blue-50 text-blue-700',
  high: 'bg-amber-50 text-amber-700',
  urgent: 'bg-red-50 text-red-700',
}

export function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString('ar-EG')
}

export function formatDateOnly(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('ar-EG')
}

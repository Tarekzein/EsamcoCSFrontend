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

/** Workflow order, for <select> options. */
export const TICKET_STATUSES = Object.keys(TICKET_STATUS_LABELS)

/** Everything except resolved/closed - mirrors the backend's OPEN_STATUSES. */
export const OPEN_TICKET_STATUSES = ['open', 'in_progress', 'pending_customer', 'escalated', 'reopened']

export const STATUS_BADGE = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-indigo-50 text-indigo-700',
  pending_customer: 'bg-amber-50 text-amber-700',
  escalated: 'bg-red-50 text-red-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-brand-gray/8 text-brand-gray/70',
  reopened: 'bg-purple-50 text-purple-700',
}

export const PRIORITY_LABELS = {
  low: 'منخفضة',
  normal: 'عادية',
  high: 'مرتفعة',
  urgent: 'عاجلة',
}

export const PRIORITIES = Object.keys(PRIORITY_LABELS)

export const PRIORITY_BADGE = {
  low: 'bg-brand-gray/8 text-brand-gray/70',
  normal: 'bg-blue-50 text-blue-700',
  high: 'bg-amber-50 text-amber-700',
  urgent: 'bg-red-50 text-red-700',
}

export const VISIBILITY_LABELS = {
  public: 'عام',
  internal: 'ملاحظة داخلية',
}

export const AUTHOR_TYPE_LABELS = {
  agent: 'موظف',
  customer: 'عميل',
  system: 'النظام',
}

function pluralizeArabic(count, [singular, dual, plural, many]) {
  if (count === 1) return singular
  if (count === 2) return dual
  if (count >= 3 && count <= 10) return `${count} ${plural}`

  return `${count} ${many}`
}

function humanizeMinutes(totalMinutes) {
  if (totalMinutes < 60) {
    return pluralizeArabic(totalMinutes, ['دقيقة', 'دقيقتين', 'دقائق', 'دقيقة'])
  }

  const hours = Math.floor(totalMinutes / 60)

  if (hours < 24) {
    return pluralizeArabic(hours, ['ساعة', 'ساعتين', 'ساعات', 'ساعة'])
  }

  return pluralizeArabic(Math.floor(hours / 24), ['يوم', 'يومين', 'أيام', 'يوماً'])
}

/**
 * Turns an SLA due date into everything the UI needs to render it.
 *
 * Deliberately computed client-side: breaches are only *flagged* on the
 * server every five minutes by ticket:check-sla-breaches, so a ticket can
 * sit visibly past its deadline before the flag flips. The countdown here
 * is authoritative for display, while the server's `breached` boolean stays
 * authoritative for the stored state - that mismatch is expected, not a bug.
 */
export function slaRemaining(dueAt) {
  if (!dueAt) return null

  const diffMs = new Date(dueAt).getTime() - Date.now()
  const overdue = diffMs < 0
  const minutes = Math.max(0, Math.floor(Math.abs(diffMs) / 60000))

  return {
    minutes,
    overdue,
    // Under an hour left and not yet past due - the window where someone
    // can still save the SLA.
    dueSoon: !overdue && minutes < 60,
    label: overdue ? `متأخر ${humanizeMinutes(minutes)}` : `متبقٍ ${humanizeMinutes(minutes)}`,
  }
}

/** Badge classes matching slaRemaining()'s three states. */
export function slaBadgeClass(sla, breached) {
  if (breached || sla?.overdue) return 'bg-red-50 text-red-700'
  if (sla?.dueSoon) return 'bg-amber-50 text-amber-700'

  return 'bg-blue-50 text-blue-700'
}

export { formatDate, formatDateOnly } from '../../lib/formatDate'

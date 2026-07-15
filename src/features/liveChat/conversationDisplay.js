// Status-pill presentation for conversations, used by both the
// conversation list and the conversation panel so a given conversation
// always renders with the same status wording in both places. Avatar
// initials/color come from the app-wide ../../lib/avatarColor so a person
// renders identically in the chat UI and in the Customers/Users tables.

export { avatarColor, initials } from '../../lib/avatarColor'

export const STATUS_CONFIG = {
  waiting: { color: 'bg-amber-400', label: 'قيد الإنتظار' },
  assigned: { color: 'bg-emerald-400', label: 'معينة' },
  active: { color: 'bg-emerald-400', label: 'نشطة' },
  closed: { color: 'bg-gray-300', label: 'مغلقة' },
}

export function statusConfigFor(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.active
}

// Ticket/priority/source vocabulary lives with the tickets feature that
// owns it - re-exported here so the customer views that already import it
// keep working unchanged.
export {
  OPEN_TICKET_STATUSES,
  PRIORITY_BADGE,
  PRIORITY_LABELS,
  SOURCE_LABELS,
  SOURCE_OPTIONS,
  TICKET_STATUS_LABELS,
} from '../tickets/ticketLabels'

export { formatDate, formatDateOnly } from '../../lib/formatDate'

export const CONVERSATION_STATUS_LABELS = {
  waiting: 'قيد الانتظار',
  assigned: 'معينة',
  active: 'نشطة',
  resolved: 'محلولة',
  closed: 'مغلقة',
}

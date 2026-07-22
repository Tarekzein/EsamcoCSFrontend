import {
  CONVERSATION_STATUS_LABELS,
  formatDate,
  formatDateOnly,
  OPEN_TICKET_STATUSES,
  PRIORITY_BADGE,
  PRIORITY_LABELS,
  SOURCE_LABELS,
  TICKET_STATUS_LABELS,
} from '../../features/customers/customerLabels'
import { ChatIcon, ChevronLeftIcon, MailIcon, PhoneIcon, TicketIcon } from '../../layouts/navIcons'
import { currentPath, navigate } from '../../router/navigation'

function InitialsAvatar({ name }) {
  const initials =
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <div className="grid size-16 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-accent via-brand-primary to-brand-navy text-lg font-black text-white">
      {initials}
    </div>
  )
}

function ActionButton({ href, onClick, disabled, primary, children }) {
  const classes = `rounded-lg px-4 py-2 text-sm font-bold transition ${
    disabled
      ? 'cursor-not-allowed border border-brand-gray/15 text-brand-gray/40'
      : primary
        ? 'bg-brand-primary text-white hover:bg-brand-navy'
        : 'border border-brand-gray/15 text-brand-gray transition hover:bg-brand-gray/8'
  }`

  if (disabled) {
    return (
      <span className={classes} title="ستتوفر هذه الميزة قريباً" aria-disabled="true">
        {children}
      </span>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    )
  }

  return (
    <a href={href} className={classes}>
      {children}
    </a>
  )
}

function StatCard({ icon: IconComponent, iconClass, label, value, comingSoon }) {
  return (
    <div className="grid gap-2 rounded-lg border border-brand-gray/15 bg-white p-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
      <span className="text-xs font-bold text-brand-gray/60">{label}</span>
      <span className="text-2xl font-black text-brand-navy">{comingSoon ? '—' : value}</span>
      <div className="flex items-center justify-between">
        <span className={`grid size-8 place-items-center rounded-lg ${iconClass}`}>
          <IconComponent className="size-4" />
        </span>
        <span className="text-[11px] font-bold text-brand-gray/40">{comingSoon ? 'قريباً' : 'عرض الكل'}</span>
      </div>
    </div>
  )
}

function ActivityRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm font-semibold text-brand-gray">
      <span className="truncate font-bold text-brand-navy">{value}</span>
      <span className="shrink-0 text-brand-gray/60">{label}</span>
    </div>
  )
}

function TicketActivityCard({ entry }) {
  // NOTE: timeline entries carry a raw serialized model, not a Resource -
  // so fields are flat snake_case (ticket.sla_response_breached) with no
  // `sla`/`escalation` nesting. Don't reuse the ticket-detail components
  // here; link out to the real detail view instead.
  const ticket = entry.model

  return (
    <button
      type="button"
      onClick={() => navigate(`/tickets/${ticket.id}`, { state: { from: currentPath() } })}
      className="grid w-full cursor-pointer gap-2.5 rounded-lg border border-brand-gray/12 bg-white p-4 text-right transition hover:border-brand-primary/30 hover:bg-brand-gray/4"
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
        <TicketIcon className="size-3.5" />
        تم إنشاء تذكرة
      </span>

      <ActivityRow label="رقم التذكرة:" value={`#${ticket.ticket_number || ticket.id}`} />
      <ActivityRow
        label="الحالة:"
        value={
          <span className="rounded-full bg-brand-gray/8 px-2 py-0.5 text-xs font-bold text-brand-gray/70">
            {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
          </span>
        }
      />
      {ticket.priority ? (
        <ActivityRow
          label="الأولوية:"
          value={
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${PRIORITY_BADGE[ticket.priority] || 'bg-brand-gray/8 text-brand-gray/70'}`}>
              {PRIORITY_LABELS[ticket.priority] || ticket.priority}
            </span>
          }
        />
      ) : null}
      <div className="flex items-center justify-between text-xs font-semibold text-brand-gray/50">
        <span>{formatDate(entry.created_at)}</span>
        <span>تاريخ:</span>
      </div>
    </button>
  )
}

const CONV_STATUS_DOT = {
  waiting: 'bg-amber-400',
  assigned: 'bg-emerald-400',
  active: 'bg-emerald-400',
  resolved: 'bg-blue-400',
  closed: 'bg-gray-300',
}

function ConversationActivityCard({ entry, onOpen }) {
  const conversation = entry.model

  return (
    <button
      type="button"
      onClick={() => onOpen(conversation.id)}
      className="grid gap-2.5 rounded-lg border border-brand-gray/12 bg-white p-4 text-right transition hover:border-brand-primary/40 hover:shadow-[0_10px_30px_rgba(17,45,95,0.08)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          <ChatIcon className="size-3.5" />
          محادثة مباشرة
        </span>
        {conversation.department?.name ? (
          <span className="rounded-full bg-brand-primary/8 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
            {conversation.department.name}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <ActivityRow label="الموظف:" value={conversation.assigned_agent?.name || 'غير معينة'} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-bold text-brand-navy">
          <span className={`size-2 rounded-full ${CONV_STATUS_DOT[conversation.status] || 'bg-gray-300'}`} />
          {CONVERSATION_STATUS_LABELS[conversation.status] || conversation.status}
        </span>
        <span className="text-xs font-semibold text-brand-gray/50">{conversation.messages_count ?? 0} رسالة</span>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-brand-gray/50">
        <span>{formatDate(entry.created_at)}</span>
        <span>تاريخ:</span>
      </div>
    </button>
  )
}

export function CustomerDetailView({ customer, timeline, timelineStatus, onBack, onOpenConversation }) {
  // The backend already scopes which conversations come back per the
  // acting user's role (CustomerService::timeline() mirrors
  // ConversationService::list()) - an agent only ever receives their own
  // assigned conversations here, never a colleague's or the unassigned
  // queue, so no further client-side filtering is needed.
  const ticketEntries = timeline.filter((entry) => entry.type === 'ticket')
  const conversationEntries = timeline.filter((entry) => entry.type === 'conversation')
  const openTicketsCount = ticketEntries.filter((entry) => OPEN_TICKET_STATUSES.includes(entry.model.status)).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-bold text-brand-gray/60">
        <button type="button" onClick={onBack} className="text-brand-primary hover:underline">
          قائمة العملاء
        </button>
        <ChevronLeftIcon className="size-3.5 rotate-180" />
        <span className="text-brand-navy">تفاصيل العميل</span>
      </div>

      <div className="rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <InitialsAvatar name={customer.name} />
            <div className="grid gap-1">
              <span className="text-lg font-black text-brand-navy">{customer.name}</span>
              <span className="text-xs font-bold text-brand-gray/60">عميل منذ {formatDateOnly(customer.created_at)}</span>
              <span className="rounded-full bg-brand-accent/10 px-2.5 py-1 text-[11px] font-bold text-brand-primary w-fit">
                {SOURCE_LABELS[customer.source] || customer.source}
              </span>
            </div>
          </div>

          <div className="grid gap-1.5 text-sm font-semibold text-brand-gray">
            <span className="flex items-center gap-2">
              <PhoneIcon className="size-4 text-brand-gray/50" />
              {customer.phone || '—'}
            </span>
            <span className="flex items-center gap-2">
              <MailIcon className="size-4 text-brand-gray/50" />
              {customer.email || '—'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-gray/10 pt-4">
          {/* Carries the customer through as a query param rather than
              cross-page state - the router is hand-rolled and has no
              route-state mechanism. TicketsListPage reads ?new=1 on mount. */}
          <ActionButton primary onClick={() => navigate(`/tickets?new=1&customer_id=${customer.id}`)}>
            + إنشاء تذكرة
          </ActionButton>
          <ActionButton disabled>بدء محادثة</ActionButton>
          <ActionButton href={customer.email ? `mailto:${customer.email}` : undefined} disabled={!customer.email}>
            إرسال بريد
          </ActionButton>
          <ActionButton href={customer.phone ? `tel:${customer.phone}` : undefined} disabled={!customer.phone}>
            اتصال
          </ActionButton>
        </div>

        {customer.notes ? (
          <p className="m-0 mt-4 whitespace-pre-wrap rounded-lg bg-brand-gray/4 p-3 text-sm font-semibold text-brand-gray">
            {customer.notes}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={TicketIcon} iconClass="bg-violet-50 text-violet-600" label="إجمالي التذاكر" value={ticketEntries.length} />
        <StatCard icon={TicketIcon} iconClass="bg-amber-50 text-amber-600" label="التذاكر المفتوحة" value={openTicketsCount} />
        <StatCard icon={ChatIcon} iconClass="bg-blue-50 text-blue-600" label="المحادثات" value={conversationEntries.length} />
        <StatCard icon={PhoneIcon} iconClass="bg-green-50 text-green-600" label="المكالمات" comingSoon />
        <StatCard icon={MailIcon} iconClass="bg-brand-gray/8 text-brand-gray/60" label="رسائل البريد" comingSoon />
      </div>

      <div className="grid gap-3 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <h2 className="m-0 text-base font-black text-brand-navy">أحدث النشاطات</h2>

        {timelineStatus === 'loading' ? (
          <p className="m-0 py-6 text-center text-sm font-semibold text-brand-gray/60">جارٍ التحميل...</p>
        ) : timeline.length === 0 ? (
          <p className="m-0 py-6 text-center text-sm font-semibold text-brand-gray/60">لا يوجد تذاكر أو محادثات لهذا العميل بعد.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...ticketEntries, ...conversationEntries]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((entry) =>
                entry.type === 'ticket' ? (
                  <TicketActivityCard key={`ticket-${entry.id}`} entry={entry} />
                ) : (
                  <ConversationActivityCard key={`conversation-${entry.id}`} entry={entry} onOpen={onOpenConversation} />
                )
              )}
          </div>
        )}
      </div>
    </div>
  )
}

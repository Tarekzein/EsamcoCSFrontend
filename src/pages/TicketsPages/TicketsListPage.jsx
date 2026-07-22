import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { loadCustomers } from '../../features/customers/customersSlice'
import { loadDepartments } from '../../features/departments/departmentsSlice'
import { TicketDetailView } from '../../features/tickets/components/TicketDetailView'
import {
  formatDate,
  PRIORITIES,
  PRIORITY_BADGE,
  PRIORITY_LABELS,
  slaBadgeClass,
  slaRemaining,
  SOURCE_LABELS,
  STATUS_BADGE,
  TICKET_STATUS_LABELS,
  TICKET_STATUSES,
} from '../../features/tickets/ticketLabels'
import {
  actionSuccessCleared,
  addTicket,
  loadTicket,
  loadTicketCategories,
  loadTicketComments,
  loadTickets,
  ticketSelected,
  ticketSelectionCleared,
  ticketsErrorCleared,
} from '../../features/tickets/ticketsSlice'
import { loadUsers } from '../../features/users/usersSlice'
import { TicketIcon } from '../../layouts/navIcons'
import { currentPath, goBack, navigate } from '../../router/navigation'
import { Pagination } from '../../components/Pagination'
import { TableEmptyState } from '../../components/TableEmptyState'
import { TableSkeletonRows } from '../../components/TableSkeletonRows'

const EMPTY_FORM = {
  subject: '',
  description: '',
  customer_id: '',
  department_id: '',
  ticket_category_id: '',
  priority: 'normal',
  external_call_ref: '',
  inbound_email_message_id: '',
}

const INPUT_CLASS =
  'rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15'

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[status] || 'bg-brand-gray/8 text-brand-gray/70'}`}>
      {TICKET_STATUS_LABELS[status] || status}
    </span>
  )
}

function PriorityBadge({ priority }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${PRIORITY_BADGE[priority] || 'bg-brand-gray/8 text-brand-gray/70'}`}>
      {PRIORITY_LABELS[priority] || priority}
    </span>
  )
}

/**
 * Compact SLA chip for the list. Shows the resolution clock, which is the
 * one agents actually plan around; the response clock only matters until
 * the first reply and is shown in full on the detail view.
 */
function SlaChip({ ticket }) {
  const breached = ticket.sla?.resolution_breached || ticket.sla?.response_breached
  const sla = slaRemaining(ticket.sla?.resolution_due_at)

  if (!sla && !breached) {
    return <span className="text-xs font-bold text-brand-gray/40">—</span>
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${slaBadgeClass(sla, breached)}`}>
      {breached ? 'تجاوز SLA' : sla?.label}
    </span>
  )
}

export function TicketsListPage({ ticketIdFromUrl }) {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)
  const isAdmin = currentUser?.role === 'admin'
  const canFilterByAgent = isAdmin || currentUser?.role === 'supervisor'

  const tickets = useAppSelector((state) => state.tickets.items)
  const meta = useAppSelector((state) => state.tickets.meta)
  const status = useAppSelector((state) => state.tickets.status)
  const error = useAppSelector((state) => state.tickets.error)
  const actionStatus = useAppSelector((state) => state.tickets.actionStatus)
  const actionError = useAppSelector((state) => state.tickets.actionError)
  const actionSuccess = useAppSelector((state) => state.tickets.actionSuccess)
  const selected = useAppSelector((state) => state.tickets.selected)
  const selectedStatus = useAppSelector((state) => state.tickets.selectedStatus)
  const categories = useAppSelector((state) => state.tickets.categories)

  const customers = useAppSelector((state) => state.customers.items)
  const departments = useAppSelector((state) => state.departments.items)
  const users = useAppSelector((state) => state.users.items)

  const [filters, setFilters] = useState({ search: '', status: '', priority: '', assignedAgentId: '' })

  // Deep link from a customer's "+ إنشاء تذكرة" button (?new=1&customer_id=).
  // Read once as initial state rather than in an effect - doing it in an
  // effect would trigger a second render pass on every mount.
  const [deepLink] = useState(() => {
    const params = new URLSearchParams(window.location.search)

    return params.get('new') === '1' ? { customerId: params.get('customer_id') || '' } : null
  })

  const [isFormOpen, setFormOpen] = useState(Boolean(deepLink))
  const [form, setForm] = useState(() =>
    deepLink ? { ...EMPTY_FORM, customer_id: deepLink.customerId } : EMPTY_FORM
  )
  const [customerSearch, setCustomerSearch] = useState('')
  const [page, setPage] = useState(1)

  const agents = useMemo(() => users.filter((user) => user.role === 'agent'), [users])

  useEffect(() => {
    dispatch(loadTickets({ ...filters, page }))
    // filters are applied explicitly via the filter form (which resets the
    // page), so they're deliberately not in this dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page])

  useEffect(() => {
    dispatch(loadTicketCategories())
  }, [dispatch])

  // Arriving via a direct link (e.g. from a chat panel or a customer's
  // timeline) - only the id is known, so fetch the full record.
  useEffect(() => {
    if (ticketIdFromUrl) {
      dispatch(loadTicket(ticketIdFromUrl))
      dispatch(loadTicketComments(ticketIdFromUrl))
    }
  }, [dispatch, ticketIdFromUrl])

  // Mirrors the live-chat success toast: show briefly, then clear.
  useEffect(() => {
    if (!actionSuccess) return undefined

    const timer = setTimeout(() => dispatch(actionSuccessCleared()), 4000)

    return () => clearTimeout(timer)
  }, [dispatch, actionSuccess])

  // The deep link opens the form, which needs the customer list to render
  // a selected option for the prefilled customer_id.
  useEffect(() => {
    if (deepLink) dispatch(loadCustomers({ perPage: 50 }))
  }, [dispatch, deepLink])

  function handleFilter(event) {
    event.preventDefault()
    setPage(1)
    dispatch(loadTickets({ ...filters, page: 1 }))
  }

  function openCreateForm() {
    dispatch(ticketsErrorCleared())
    setForm(EMPTY_FORM)
    setFormOpen(true)

    // Only loaded when the form is actually opened - the list itself has no
    // use for customers/departments/agents.
    dispatch(loadCustomers({ perPage: 50 }))
    if (isAdmin) dispatch(loadDepartments())
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function searchCustomers(event) {
    event.preventDefault()
    dispatch(loadCustomers({ search: customerSearch || undefined, perPage: 50 }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    // Only admins pick a department; for everyone else the backend forces
    // it to their own in StoreTicketRequest::prepareForValidation(), so we
    // just send theirs rather than tracking it in form state.
    const departmentId = isAdmin ? Number(form.department_id) : currentUser?.department_id

    const action = await dispatch(
      addTicket({
        subject: form.subject,
        description: form.description,
        customer_id: Number(form.customer_id),
        department_id: departmentId,
        ticket_category_id: form.ticket_category_id ? Number(form.ticket_category_id) : null,
        priority: form.priority,
        external_call_ref: form.external_call_ref || null,
        inbound_email_message_id: form.inbound_email_message_id || null,
      })
    )

    if (!action.error) {
      setFormOpen(false)
      setForm(EMPTY_FORM)
      // Clear the ?new=1 deep link so a refresh doesn't reopen the form.
      if (window.location.search) navigate('/tickets')
    }
  }

  function openDetails(ticket) {
    dispatch(ticketSelected(ticket))
    if (canFilterByAgent) dispatch(loadUsers({ perPage: 100 }))
    navigate(`/tickets/${ticket.id}`, { state: { from: currentPath() } })
  }

  function closeDetails() {
    dispatch(ticketSelectionCleared())
    if (ticketIdFromUrl) goBack('/tickets')
  }

  if (ticketIdFromUrl && selected?.id !== ticketIdFromUrl) {
    return (
      <div dir="rtl" className="flex flex-col gap-4">
        <p className="m-0 rounded-lg border border-brand-gray/15 bg-white p-6 text-center text-sm font-bold text-brand-gray/60">
          {selectedStatus === 'failed' ? 'تعذر العثور على التذكرة.' : 'جارٍ التحميل...'}
        </p>
      </div>
    )
  }

  if (selected && selected.id === ticketIdFromUrl) {
    return (
      <div dir="rtl">
        <TicketDetailView ticket={selected} onBack={closeDetails} />
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)] max-sm:flex-col max-sm:items-stretch">
        <div className="flex items-center gap-2.5">
          <h1 className="m-0 text-lg font-black text-brand-navy">التذاكر</h1>
          <span className="rounded-full bg-brand-gray/8 px-2.5 py-1 text-xs font-bold text-brand-gray/60">{meta?.total ?? tickets.length}</span>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy"
        >
          + تذكرة جديدة
        </button>
      </div>

      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-brand-gray/15 bg-white p-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)]"
      >
        <label className="grid min-w-56 flex-1 gap-1 text-sm font-bold text-brand-gray">
          البحث
          <input
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            placeholder="رقم التذكرة أو الموضوع..."
            className={INPUT_CLASS}
          />
        </label>

        <label className="grid gap-1 text-sm font-bold text-brand-gray">
          الحالة
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            className={INPUT_CLASS}
          >
            <option value="">كل الحالات</option>
            {TICKET_STATUSES.map((value) => (
              <option key={value} value={value}>
                {TICKET_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-bold text-brand-gray">
          الأولوية
          <select
            value={filters.priority}
            onChange={(event) => setFilters({ ...filters, priority: event.target.value })}
            className={INPUT_CLASS}
          >
            <option value="">كل الأولويات</option>
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        {canFilterByAgent ? (
          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الموظف المسؤول
            <select
              value={filters.assignedAgentId}
              onChange={(event) => setFilters({ ...filters, assignedAgentId: event.target.value })}
              onFocus={() => { if (!users.length) dispatch(loadUsers({ perPage: 100 })) }}
              className={INPUT_CLASS}
            >
              <option value="">الكل</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <button
          type="submit"
          className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy"
        >
          تصفية
        </button>
      </form>

      {actionSuccess ? (
        <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-sm font-bold text-emerald-700">
          {actionSuccess}
        </p>
      ) : null}

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">{error}</p>
      ) : null}

      {isFormOpen ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)] sm:grid-cols-2"
        >
          <h2 className="m-0 text-base font-black text-brand-navy sm:col-span-2">تذكرة جديدة</h2>

          {actionError ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 sm:col-span-2">
              {actionError}
            </p>
          ) : null}

          <label className="grid gap-1 text-sm font-bold text-brand-gray sm:col-span-2">
            الموضوع
            <input
              required
              minLength={3}
              value={form.subject}
              onChange={(event) => handleChange('subject', event.target.value)}
              className={INPUT_CLASS}
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray sm:col-span-2">
            الوصف
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              className={INPUT_CLASS}
            />
          </label>

          <div className="grid gap-1 text-sm font-bold text-brand-gray">
            العميل
            <div className="flex gap-2">
              <input
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الهاتف..."
                className={`${INPUT_CLASS} flex-1`}
              />
              <button
                type="button"
                onClick={searchCustomers}
                className="rounded-lg border border-brand-gray/15 px-3 py-2 text-xs font-bold text-brand-gray transition hover:bg-brand-gray/8"
              >
                بحث
              </button>
            </div>
            <select
              required
              value={form.customer_id}
              onChange={(event) => handleChange('customer_id', event.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">اختر العميل</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.phone ? ` — ${customer.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {isAdmin ? (
            <label className="grid gap-1 text-sm font-bold text-brand-gray">
              القسم
              <select
                required
                value={form.department_id}
                onChange={(event) => handleChange('department_id', event.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">اختر القسم</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الفئة
            <select
              value={form.ticket_category_id}
              onChange={(event) => handleChange('ticket_category_id', event.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">بدون فئة</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الأولوية
            <select
              value={form.priority}
              onChange={(event) => handleChange('priority', event.target.value)}
              className={INPUT_CLASS}
            >
              {PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="grid gap-3 rounded-lg border border-brand-gray/15 p-4 sm:col-span-2 sm:grid-cols-2">
            <legend className="px-2 text-xs font-bold text-brand-gray/60">المصادر المرتبطة (اختياري)</legend>

            <label className="grid gap-1 text-sm font-bold text-brand-gray">
              مرجع المكالمة
              <input
                value={form.external_call_ref}
                onChange={(event) => handleChange('external_call_ref', event.target.value)}
                placeholder="مثال: CALL-8891"
                className={INPUT_CLASS}
              />
            </label>

            <label className="grid gap-1 text-sm font-bold text-brand-gray">
              معرّف رسالة البريد
              <input
                value={form.inbound_email_message_id}
                onChange={(event) => handleChange('inbound_email_message_id', event.target.value)}
                placeholder="<message-id@example.com>"
                className={INPUT_CLASS}
              />
            </label>
          </fieldset>

          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={actionStatus === 'loading'}
              className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy disabled:opacity-60"
            >
              {actionStatus === 'loading' ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-lg border border-brand-gray/15 px-5 py-2.5 text-sm font-bold text-brand-gray transition hover:bg-brand-gray/8"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-brand-gray/15 bg-white shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <table className="w-full min-w-200 text-right text-sm">
          <thead>
            <tr className="border-b border-brand-gray/15 text-xs font-bold text-brand-gray/60">
              <th className="px-4 py-3">رقم التذكرة</th>
              <th className="px-4 py-3">الموضوع</th>
              <th className="px-4 py-3">العميل</th>
              <th className="px-4 py-3">المسؤول</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">الأولوية</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              <TableSkeletonRows rows={6} columns={8} />
            ) : tickets.length === 0 ? (
              <TableEmptyState colSpan={8} icon={TicketIcon} message="لا توجد تذاكر بعد" />
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => openDetails(ticket)}
                  className="cursor-pointer border-b border-brand-gray/8 align-top transition last:border-0 hover:bg-brand-gray/4"
                >
                  <td className="px-4 py-3 font-black text-brand-primary">{ticket.ticket_number}</td>
                  <td className="px-4 py-3">
                    <div className="grid gap-1">
                      <span className="font-bold text-brand-navy">{ticket.subject}</span>
                      <span className="text-[10px] font-bold text-brand-gray/50">
                        {SOURCE_LABELS[ticket.source] || ticket.source}
                        {ticket.comments_count ? ` · ${ticket.comments_count} تعليق` : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{ticket.customer?.name || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">
                    {ticket.assigned_agent?.name || <span className="text-brand-gray/40">غير مسندة</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <SlaChip ticket={ticket} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{formatDate(ticket.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  )
}

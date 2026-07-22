import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { navigate } from '../../../router/navigation'
import {
  assignSelectedTicket,
  claimSelectedTicket,
  closeSelectedTicket,
  escalateSelectedTicket,
  removeTicket,
  reopenSelectedTicket,
  resolveSelectedTicket,
} from '../ticketsSlice'

const PRIMARY = 'rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-navy disabled:opacity-60'
const SECONDARY =
  'rounded-lg border border-brand-gray/15 px-4 py-2 text-xs font-bold text-brand-gray transition hover:bg-brand-gray/8 disabled:opacity-60'
const DANGER = 'rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60'

/**
 * Hand-rolled modal matching the one in AuditLogsListPage - backdrop click
 * closes, inner click doesn't propagate. No portal or focus trap exists
 * anywhere in this app yet.
 */
function PromptModal({ title, label, placeholder, confirmLabel, onConfirm, onCancel, isBusy }) {
  const [value, setValue] = useState('')

  return (
    <div onClick={onCancel} className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        dir="rtl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          onConfirm(value)
        }}
        className="grid w-full max-w-md gap-4 rounded-lg bg-white p-5 shadow-xl"
      >
        <h3 className="m-0 text-base font-black text-brand-navy">{title}</h3>

        <label className="grid gap-1 text-sm font-bold text-brand-gray">
          {label}
          <textarea
            rows={4}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          />
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={isBusy} className={PRIMARY}>
            {isBusy ? 'جارٍ التنفيذ...' : confirmLabel}
          </button>
          <button type="button" onClick={onCancel} className={SECONDARY}>
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}

export function TicketActionsBar({ ticket }) {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)
  const users = useAppSelector((state) => state.users.items)
  const actionStatus = useAppSelector((state) => state.tickets.actionStatus)
  const isBusy = actionStatus === 'loading'

  const role = currentUser?.role
  const isAdmin = role === 'admin'
  const canAssign = isAdmin || role === 'supervisor'

  const [prompt, setPrompt] = useState(null)
  const [assigneeId, setAssigneeId] = useState('')

  // Only agents in this ticket's department can take it.
  const departmentAgents = useMemo(
    () => users.filter((user) => user.role === 'agent' && user.department_id === ticket.department?.id),
    [users, ticket.department?.id]
  )

  const isClosed = ticket.status === 'closed'
  const isResolved = ticket.status === 'resolved'
  const isUnassigned = !ticket.assigned_agent

  async function handleAssign(event) {
    event.preventDefault()
    if (!assigneeId) return

    await dispatch(assignSelectedTicket({ id: ticket.id, agentId: Number(assigneeId) }))
    setAssigneeId('')
  }

  async function handleDelete() {
    if (!window.confirm(`هل تريد حذف التذكرة ${ticket.ticket_number}؟`)) return

    const action = await dispatch(removeTicket(ticket.id))

    if (!action.error) navigate('/tickets')
  }

  return (
    <section className="grid gap-3 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
      <h3 className="m-0 text-sm font-black text-brand-navy">الإجراءات</h3>

      <div className="flex flex-wrap gap-2">
        {/* Hidden rather than disabled when already assigned: the backend
            throws on a double-claim, and that error message is English. */}
        {isUnassigned ? (
          <button type="button" disabled={isBusy} onClick={() => dispatch(claimSelectedTicket(ticket.id))} className={PRIMARY}>
            استلام التذكرة
          </button>
        ) : null}

        {!isClosed && !isResolved ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              setPrompt({
                title: 'تصعيد التذكرة',
                label: 'سبب التصعيد (اختياري)',
                placeholder: 'لماذا تحتاج هذه التذكرة إلى تصعيد؟',
                confirmLabel: 'تصعيد',
                onConfirm: (reason) => {
                  dispatch(escalateSelectedTicket({ id: ticket.id, reason: reason || null }))
                  setPrompt(null)
                },
              })
            }
            className={SECONDARY}
          >
            تصعيد
          </button>
        ) : null}

        {!isResolved && !isClosed ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              setPrompt({
                title: 'حل التذكرة',
                label: 'ملاحظة الحل (اختياري)',
                placeholder: 'كيف تم حل المشكلة؟',
                confirmLabel: 'تأكيد الحل',
                onConfirm: (note) => {
                  dispatch(resolveSelectedTicket({ id: ticket.id, resolutionNote: note || null }))
                  setPrompt(null)
                },
              })
            }
            className={PRIMARY}
          >
            حل
          </button>
        ) : null}

        {!isClosed ? (
          <button type="button" disabled={isBusy} onClick={() => dispatch(closeSelectedTicket(ticket.id))} className={SECONDARY}>
            إغلاق
          </button>
        ) : null}

        {isClosed || isResolved ? (
          <button type="button" disabled={isBusy} onClick={() => dispatch(reopenSelectedTicket(ticket.id))} className={SECONDARY}>
            إعادة فتح
          </button>
        ) : null}

        {isAdmin ? (
          <button type="button" disabled={isBusy} onClick={handleDelete} className={DANGER}>
            حذف
          </button>
        ) : null}
      </div>

      {canAssign ? (
        <form onSubmit={handleAssign} className="flex flex-wrap items-end gap-2 border-t border-brand-gray/10 pt-3">
          <label className="grid flex-1 gap-1 text-xs font-bold text-brand-gray">
            إسناد إلى
            <select
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            >
              <option value="">اختر موظفاً</option>
              {departmentAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={isBusy || !assigneeId} className={SECONDARY}>
            إسناد
          </button>
        </form>
      ) : null}

      {prompt ? <PromptModal {...prompt} isBusy={isBusy} onCancel={() => setPrompt(null)} /> : null}
    </section>
  )
}

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  ACTIVE_CALL_STATUSES,
  CALL_STATUS_BADGE,
  CALL_STATUS_DOT,
  CALL_STATUS_LABELS,
  formatDate,
  formatDuration,
} from '../../features/telephony/callLabels'
import { callSelectionCleared, loadCall, loadCalls, startClickToCall, telephonyErrorCleared } from '../../features/telephony/telephonySlice'
import { PhoneIcon } from '../../layouts/navIcons'
import { Pagination } from '../../components/Pagination'
import { TableEmptyState } from '../../components/TableEmptyState'
import { TableSkeletonRows } from '../../components/TableSkeletonRows'

const EXTENSION_STORAGE_KEY = 'telephony_agent_extension'
const POLL_INTERVAL_MS = 5000

function StatusBadge({ status }) {
  const isActive = ACTIVE_CALL_STATUSES.includes(status)

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${CALL_STATUS_BADGE[status] || 'bg-brand-gray/8 text-brand-gray/70'}`}>
      <span className={`size-1.5 rounded-full ${CALL_STATUS_DOT[status] || 'bg-brand-gray/30'} ${isActive ? 'animate-pulse' : ''}`} />
      {CALL_STATUS_LABELS[status] || status}
    </span>
  )
}

export function CallsListPage() {
  const dispatch = useAppDispatch()

  const calls = useAppSelector((state) => state.telephony.items)
  const meta = useAppSelector((state) => state.telephony.meta)
  const status = useAppSelector((state) => state.telephony.status)
  const error = useAppSelector((state) => state.telephony.error)
  const actionStatus = useAppSelector((state) => state.telephony.actionStatus)
  const actionError = useAppSelector((state) => state.telephony.actionError)
  const selected = useAppSelector((state) => state.telephony.selected)
  const selectedStatus = useAppSelector((state) => state.telephony.selectedStatus)

  const [page, setPage] = useState(1)
  const [agentExtension, setAgentExtension] = useState(() => localStorage.getItem(EXTENSION_STORAGE_KEY) || '')
  const [customerNumber, setCustomerNumber] = useState('')

  useEffect(() => {
    dispatch(loadCalls({ page }))
  }, [dispatch, page])

  // No websocket broadcast exists for call status yet (unlike Live Chat) -
  // status transitions (ringing -> answered -> completed) come from
  // Asterisk AMI events on the backend, so polling is the only way to see
  // them here. Only polls while a call on the current page is still in
  // flight, so an idle calls list doesn't hit the API every few seconds.
  useEffect(() => {
    const hasActiveCalls = calls.some((call) => ACTIVE_CALL_STATUSES.includes(call.status))
    if (!hasActiveCalls) return

    const interval = setInterval(() => {
      dispatch(loadCalls({ page }))
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [dispatch, page, calls])

  async function handleClickToCall(event) {
    event.preventDefault()
    dispatch(telephonyErrorCleared())

    const action = await dispatch(
      startClickToCall({
        agent_extension: agentExtension.trim(),
        customer_number: customerNumber.trim(),
      })
    )

    if (!action.error) {
      localStorage.setItem(EXTENSION_STORAGE_KEY, agentExtension.trim())
      setCustomerNumber('')
    }
  }

  function openDetails(call) {
    dispatch(loadCall(call.id))
  }

  function closeDetails() {
    dispatch(callSelectionCleared())
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)] max-sm:flex-col max-sm:items-stretch">
        <div className="flex items-center gap-2.5">
          <h1 className="m-0 text-lg font-black text-brand-navy">المكالمات</h1>
          <span className="rounded-full bg-brand-gray/8 px-2.5 py-1 text-xs font-bold text-brand-gray/60">{meta?.total ?? calls.length}</span>
        </div>
      </div>

      <form
        onSubmit={handleClickToCall}
        className="grid gap-3 rounded-lg border border-brand-gray/15 bg-white p-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)] sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="grid gap-1 text-sm font-bold text-brand-gray">
          تحويلة الموظف
          <input
            required
            value={agentExtension}
            onChange={(event) => setAgentExtension(event.target.value)}
            placeholder="مثال: 101"
            className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          />
        </label>

        <label className="grid gap-1 text-sm font-bold text-brand-gray">
          رقم العميل
          <input
            required
            value={customerNumber}
            onChange={(event) => setCustomerNumber(event.target.value)}
            placeholder="مثال: 01012345678"
            className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          />
        </label>

        <button
          type="submit"
          disabled={actionStatus === 'loading'}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy disabled:opacity-60"
        >
          <PhoneIcon className="size-4" />
          {actionStatus === 'loading' ? 'جارٍ الاتصال...' : 'اتصال الآن'}
        </button>
      </form>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">{error}</p>
      ) : null}

      {actionError ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">{actionError}</p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-brand-gray/15 bg-white shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <table className="w-full min-w-180 text-right text-sm">
          <thead>
            <tr className="border-b border-brand-gray/15 text-xs font-bold text-brand-gray/60">
              <th className="px-4 py-3">رقم العميل</th>
              <th className="px-4 py-3">تحويلة الموظف</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">المدة</th>
              <th className="px-4 py-3">تاريخ البدء</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              <TableSkeletonRows rows={6} columns={6} />
            ) : calls.length === 0 ? (
              <TableEmptyState colSpan={6} icon={PhoneIcon} message="لا توجد مكالمات بعد" />
            ) : (
              calls.map((call) => (
                <tr key={call.id} className="border-b border-brand-gray/8 transition last:border-0 hover:bg-brand-gray/4">
                  <td className="px-4 py-3 font-bold text-brand-navy">{call.customer_number}</td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{call.agent_extension}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{formatDuration(call.started_at, call.ended_at)}</td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{formatDate(call.started_at || call.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openDetails(call)}
                      className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/8"
                    >
                      التفاصيل
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      {selected || selectedStatus === 'loading' ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={closeDetails}>
          <div
            className="grid w-full max-w-md gap-4 rounded-lg bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-base font-black text-brand-navy">تفاصيل المكالمة</h2>
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-gray transition hover:bg-brand-gray/8"
              >
                إغلاق
              </button>
            </div>

            {selectedStatus === 'loading' ? (
              <p className="m-0 text-center font-semibold text-brand-gray/60">جارٍ التحميل...</p>
            ) : selected ? (
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selected.status} />
                  <span className="font-bold text-brand-navy">#{selected.id}</span>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-lg border border-brand-gray/10 bg-brand-gray/3 p-3">
                  <dt className="font-bold text-brand-gray/60">رقم العميل</dt>
                  <dd className="m-0 font-semibold text-brand-navy">{selected.customer_number}</dd>

                  <dt className="font-bold text-brand-gray/60">تحويلة الموظف</dt>
                  <dd className="m-0 font-semibold text-brand-navy">{selected.agent_extension}</dd>

                  <dt className="font-bold text-brand-gray/60">القناة</dt>
                  <dd className="m-0 font-semibold text-brand-navy">{selected.channel || '—'}</dd>

                  <dt className="font-bold text-brand-gray/60">المعرّف الفريد</dt>
                  <dd className="m-0 truncate font-semibold text-brand-navy">{selected.uniqueid || '—'}</dd>

                  <dt className="font-bold text-brand-gray/60">وقت البدء</dt>
                  <dd className="m-0 font-semibold text-brand-navy">{formatDate(selected.started_at)}</dd>

                  <dt className="font-bold text-brand-gray/60">وقت الانتهاء</dt>
                  <dd className="m-0 font-semibold text-brand-navy">{formatDate(selected.ended_at)}</dd>

                  <dt className="font-bold text-brand-gray/60">المدة</dt>
                  <dd className="m-0 font-semibold text-brand-navy">{formatDuration(selected.started_at, selected.ended_at)}</dd>

                  {selected.recording_file ? (
                    <>
                      <dt className="font-bold text-brand-gray/60">التسجيل</dt>
                      <dd className="m-0 truncate font-semibold text-brand-navy">{selected.recording_file}</dd>
                    </>
                  ) : null}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { SearchableSelect } from '../../../components/SearchableSelect'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { navigate } from '../../../router/navigation'
import { fetchAvailableLiveChats, fetchMergeTargets } from '../ticketsAPI'
import { attachTicketLiveChat, mergeSelectedTicket } from '../ticketsSlice'

function ConversationOption({ conversation }) {
  return (
    <span className="grid gap-1">
      <span className="flex items-center justify-between gap-3"><strong className="text-sm text-brand-navy">{conversation.visitor_name || 'زائر'}</strong><span className="text-[10px] font-bold text-brand-primary">#{conversation.id}</span></span>
      <span className="flex flex-wrap gap-2 text-[11px] font-semibold text-brand-gray/50"><span>{conversation.status}</span><span>•</span><span>{conversation.messages_count ?? 0} رسالة</span>{conversation.started_at ? <><span>•</span><span>{new Date(conversation.started_at).toLocaleDateString('ar-EG')}</span></> : null}</span>
    </span>
  )
}

function TicketOption({ ticket }) {
  return (
    <span className="grid gap-1">
      <span className="flex items-center justify-between gap-3"><strong className="text-sm text-brand-navy">{ticket.ticket_number}</strong><span className="rounded-full bg-brand-gray/8 px-2 py-0.5 text-[10px] font-bold">{ticket.status}</span></span>
      <span className="truncate text-[11px] font-semibold text-brand-gray/55">{ticket.subject}</span>
    </span>
  )
}

export function TicketRelationshipActions({ ticket }) {
  const dispatch = useAppDispatch()
  const actionStatus = useAppSelector((state) => state.tickets.actionStatus)
  const [panel, setPanel] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [targetTicket, setTargetTicket] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const loadConversations = useCallback((search) => fetchAvailableLiveChats(ticket.id, search), [ticket.id])
  const loadTargets = useCallback((search) => fetchMergeTargets(ticket.id, search), [ticket.id])
  const isBusy = actionStatus === 'loading'

  useEffect(() => {
    if (panel !== 'merge') return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') setPanel(null)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [panel])

  async function attachConversation(event) {
    event.preventDefault()
    if (!conversation) return
    const action = await dispatch(attachTicketLiveChat({ id: ticket.id, conversationId: conversation.id }))
    if (!action.error) {
      setConversation(null)
      setPanel(null)
    }
  }

  async function merge(event) {
    event.preventDefault()
    if (!confirmed || !targetTicket) return
    const action = await dispatch(mergeSelectedTicket({ sourceId: ticket.id, targetTicketId: targetTicket.id }))
    if (!action.error) navigate(`/tickets/${action.payload.id}`, { replace: true, state: { mergedFrom: ticket.ticket_number } })
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => setPanel(panel === 'attach' ? null : 'attach')} className="flex items-center justify-between gap-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 px-4 py-3 text-right transition hover:border-brand-primary/35 hover:bg-brand-primary/8">
          <span className="grid gap-0.5"><strong className="text-sm text-brand-navy">ربط محادثة</strong><span className="text-[11px] font-semibold text-brand-gray/55">اختر من المحادثات المتاحة لك فقط</span></span><span aria-hidden className="text-xl text-brand-primary">＋</span>
        </button>
        <button type="button" onClick={() => setPanel('merge')} className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-right transition hover:border-red-300 hover:bg-red-50">
          <span className="grid gap-0.5"><strong className="text-sm text-red-900">دمج التذكرة</strong><span className="text-[11px] font-semibold text-red-700/65">ادمجها مع تذكرة متوافقة ومصرح بها</span></span><span aria-hidden className="text-lg text-red-700">⇄</span>
        </button>
      </div>

      {panel === 'attach' ? (
        <form onSubmit={attachConversation} className="grid gap-3 rounded-xl border border-brand-primary/15 bg-brand-primary/3 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <SearchableSelect
            label="ابحث باسم العميل أو رقم المحادثة"
            value={conversation}
            onChange={setConversation}
            loadOptions={loadConversations}
            renderValue={(option) => `${option.visitor_name || 'زائر'} — #${option.id}`}
            renderOption={(option) => <ConversationOption conversation={option} />}
            placeholder="اكتب اسم الزائر، الهاتف، البريد أو الرقم..."
            emptyMessage="لا توجد محادثات غير مرتبطة متاحة لهذه التذكرة."
          />
          <div className="flex gap-2"><button disabled={!conversation || isBusy} className="rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-black text-white disabled:opacity-50">{isBusy ? 'جارٍ الربط...' : 'ربط المحددة'}</button><button type="button" onClick={() => setPanel(null)} className="rounded-xl border border-brand-gray/15 px-4 py-2.5 text-xs font-bold">إلغاء</button></div>
        </form>
      ) : null}

      {panel === 'merge' ? (
        <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(null) }} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-navy/55 p-4 backdrop-blur-[2px]">
          <form role="dialog" aria-modal="true" aria-labelledby="merge-title" onSubmit={merge} className="grid w-full max-w-xl gap-5 rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4"><div className="grid gap-1"><h2 id="merge-title" className="m-0 text-lg font-black text-brand-navy">دمج {ticket.ticket_number}</h2><p className="m-0 text-xs font-semibold text-brand-gray/55">ستغلق التذكرة الحالية وتنتقل مراسلاتها وقنواتها إلى الهدف.</p></div><button type="button" aria-label="إغلاق" onClick={() => setPanel(null)} className="grid size-9 place-items-center rounded-full text-xl text-brand-gray/45 hover:bg-brand-gray/8">×</button></div>
            <div className="grid gap-2 rounded-xl bg-brand-gray/4 p-4 text-xs sm:grid-cols-2"><span><b className="text-brand-gray/50">العميل:</b> {ticket.customer?.name}</span><span><b className="text-brand-gray/50">القسم:</b> {ticket.department?.name}</span></div>
            <SearchableSelect
              label="اختر التذكرة الهدف"
              value={targetTicket}
              onChange={(option) => { setTargetTicket(option); setConfirmed(false) }}
              loadOptions={loadTargets}
              renderValue={(option) => `${option.ticket_number} — ${option.subject}`}
              renderOption={(option) => <TicketOption ticket={option} />}
              placeholder="ابحث برقم التذكرة أو الموضوع..."
              emptyMessage="لا توجد تذاكر متوافقة ومصرح بها للدمج."
            />
            {targetTicket ? <div className="grid gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs"><strong className="text-blue-900">سيتم الدمج إلى {targetTicket.ticket_number}</strong><span className="font-semibold text-blue-800/70">{targetTicket.subject}</span></div> : null}
            <label className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800"><input type="checkbox" checked={confirmed} disabled={!targetTicket} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5" />أفهم أن الدمج غير قابل للتراجع وأن حالة التذكرة الهدف ومواعيد SLA الخاصة بها لن تتغير.</label>
            <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setPanel(null)} className="rounded-xl border border-brand-gray/15 px-5 py-2.5 text-xs font-bold">إلغاء</button><button disabled={!targetTicket || !confirmed || isBusy} className="rounded-xl bg-red-700 px-5 py-2.5 text-xs font-black text-white disabled:opacity-50">{isBusy ? 'جارٍ الدمج...' : 'تأكيد الدمج'}</button></div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

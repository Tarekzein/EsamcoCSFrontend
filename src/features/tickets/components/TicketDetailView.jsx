import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { AppLink } from '../../../router/AppLink'
import { navigate } from '../../../router/navigation'
import { ChevronLeftIcon } from '../../../layouts/navIcons'
import {
  formatDate,
  PRIORITIES,
  PRIORITY_BADGE,
  PRIORITY_LABELS,
  SOURCE_LABELS,
  STATUS_BADGE,
  TICKET_STATUS_LABELS,
  TICKET_STATUSES,
} from '../ticketLabels'
import { editTicket } from '../ticketsSlice'
import { useTicketChannel } from '../useTicketsChannel'
import { TicketActionsBar } from './TicketActionsBar'
import { TicketAttachments } from './TicketAttachments'
import { TicketCommentsThread } from './TicketCommentsThread'
import { TicketLinkedRecords } from './TicketLinkedRecords'
import { TicketSlaCard } from './TicketSlaCard'

const SELECT_CLASS = 'max-w-44 rounded-lg border border-brand-gray/15 bg-white px-2.5 py-1.5 text-xs font-bold outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15'
const TABS = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'correspondence', label: 'المراسلات' },
  { id: 'channels', label: 'القنوات' },
  { id: 'attachments', label: 'المرفقات' },
]

function MetaRow({ label, children }) {
  return <div className="flex items-start justify-between gap-3 border-b border-brand-gray/8 py-3 last:border-0"><span className="text-xs font-bold text-brand-gray/50">{label}</span><span className="text-left text-xs font-semibold text-brand-gray">{children}</span></div>
}

function CountCard({ label, value, tone = 'text-brand-primary' }) {
  return <div className="grid gap-0.5 rounded-xl border border-white/65 bg-white/75 px-4 py-3 backdrop-blur"><span className={`text-lg font-black ${tone}`}>{value}</span><span className="text-[11px] font-bold text-brand-gray/55">{label}</span></div>
}

export function TicketDetailView({ ticket, onBack }) {
  const dispatch = useAppDispatch()
  const categories = useAppSelector((state) => state.tickets.categories)
  const actionError = useAppSelector((state) => state.tickets.actionError)
  const actionSuccess = useAppSelector((state) => state.tickets.actionSuccess)
  const [activeTab, setActiveTab] = useState('overview')
  const mergedFrom = ticket.merged_into?.id ? '' : window.history.state?.mergedFrom

  useEffect(() => {
    if (ticket.merged_into?.id) {
      navigate(`/tickets/${ticket.merged_into.id}`, { replace: true, state: { mergedFrom: ticket.ticket_number } })
    }
  }, [ticket.merged_into?.id, ticket.ticket_number])

  useTicketChannel(ticket.id)

  function patch(field, value) {
    dispatch(editTicket({ id: ticket.id, data: { [field]: value } }))
  }

  return (
    <div className="grid gap-4">
      <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs font-bold text-brand-gray/50">
        <AppLink to="/tickets" className="transition hover:text-brand-primary">التذاكر</AppLink><span aria-hidden>/</span><span className="text-brand-gray">{ticket.ticket_number}</span>
      </nav>

      <header className="grid gap-5 overflow-hidden rounded-2xl border border-brand-primary/12 bg-gradient-to-bl from-brand-primary/9 via-white to-white p-5 shadow-[0_14px_42px_rgba(17,45,95,0.07)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid min-w-0 gap-2">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-black text-brand-primary">{ticket.ticket_number}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[ticket.status] || 'bg-brand-gray/8'}`}>{TICKET_STATUS_LABELS[ticket.status] || ticket.status}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${PRIORITY_BADGE[ticket.priority] || 'bg-brand-gray/8'}`}>{PRIORITY_LABELS[ticket.priority] || ticket.priority}</span>{ticket.is_overdue ? <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">متأخرة</span> : null}</div>
            <h1 className="m-0 max-w-3xl text-xl font-black leading-8 text-brand-navy sm:text-2xl">{ticket.subject}</h1>
            <p className="m-0 text-xs font-semibold text-brand-gray/55">{ticket.customer?.name || 'عميل غير معروف'} · {ticket.department?.name || 'بدون قسم'} · أُنشئت {formatDate(ticket.created_at)}</p>
          </div>
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 rounded-xl border border-brand-gray/12 bg-white px-4 py-2.5 text-sm font-bold text-brand-gray shadow-sm transition hover:border-brand-primary/20 hover:text-brand-primary"><ChevronLeftIcon className="size-4 rotate-180" />العودة</button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <CountCard label="المراسلات العامة" value={ticket.correspondence?.public_replies_count ?? 0} />
          <CountCard label="المحادثات" value={ticket.interaction_counts?.live_chat ?? 0} />
          <CountCard label="المرفقات" value={ticket.attachments_count ?? 0} />
          <CountCard label="إعادات الفتح" value={ticket.reopened_count ?? 0} tone={ticket.reopened_count ? 'text-amber-700' : 'text-brand-primary'} />
        </div>
      </header>

      {actionSuccess ? <p role="status" className="m-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700">{actionSuccess}</p> : null}
      {mergedFrom ? <p role="status" className="m-0 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-800">تم دمج التذكرة {mergedFrom} في هذه التذكرة.</p> : null}
      {actionError ? <p role="alert" className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">{actionError}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="grid min-w-0 content-start gap-4">
          <div className="overflow-x-auto rounded-xl border border-brand-gray/12 bg-white p-1.5 shadow-[0_8px_26px_rgba(17,45,95,0.04)]">
            <div role="tablist" aria-label="أقسام التذكرة" className="flex min-w-max gap-1">
              {TABS.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`rounded-lg px-4 py-2.5 text-xs font-black transition ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-gray/60 hover:bg-brand-gray/6 hover:text-brand-gray'}`}>{tab.label}{tab.id === 'correspondence' && ticket.comments_count ? <span className="mr-1.5 opacity-70">({ticket.comments_count})</span> : null}</button>)}
            </div>
          </div>

          {activeTab === 'overview' ? (
            <section className="grid gap-5 rounded-2xl border border-brand-gray/12 bg-white p-5 shadow-[0_12px_36px_rgba(17,45,95,0.05)] sm:p-6">
              <div className="grid gap-1"><h2 className="m-0 text-base font-black text-brand-navy">وصف الحالة</h2><p className="m-0 text-xs font-semibold text-brand-gray/50">المشكلة الأساسية كما سُجلت عند فتح التذكرة</p></div>
              <p className="m-0 whitespace-pre-wrap rounded-xl bg-brand-gray/4 p-4 text-sm font-semibold leading-7 text-brand-gray">{ticket.description}</p>
              {ticket.resolution_note ? <div className="grid gap-1 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><strong className="text-xs text-emerald-900">ملاحظة الحل</strong><p className="m-0 whitespace-pre-wrap text-sm font-semibold text-emerald-800">{ticket.resolution_note}</p></div> : null}
              <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setActiveTab('correspondence')} className="rounded-xl border border-brand-gray/12 p-4 text-right transition hover:border-brand-primary/25 hover:bg-brand-primary/3"><strong className="block text-sm text-brand-navy">متابعة المراسلات</strong><span className="text-xs font-semibold text-brand-gray/50">عرض الردود والملاحظات وإضافة رد جديد</span></button><button type="button" onClick={() => setActiveTab('channels')} className="rounded-xl border border-brand-gray/12 p-4 text-right transition hover:border-brand-primary/25 hover:bg-brand-primary/3"><strong className="block text-sm text-brand-navy">إدارة القنوات</strong><span className="text-xs font-semibold text-brand-gray/50">ربط محادثة أو مراجعة المكالمات والبريد</span></button></div>
            </section>
          ) : null}
          {activeTab === 'correspondence' ? <TicketCommentsThread ticket={ticket} /> : null}
          {activeTab === 'channels' ? <TicketLinkedRecords ticket={ticket} /> : null}
          {activeTab === 'attachments' ? <TicketAttachments ticket={ticket} /> : null}
        </main>

        <aside className="grid content-start gap-4 xl:sticky xl:top-4 xl:self-start">
          <TicketActionsBar ticket={ticket} />
          <TicketSlaCard ticket={ticket} />
          <section className="grid gap-1 rounded-2xl border border-brand-gray/12 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.05)]">
            <div className="mb-2 flex items-center justify-between gap-2"><h2 className="m-0 text-sm font-black text-brand-navy">تفاصيل التذكرة</h2><span className="rounded-full bg-brand-gray/6 px-2 py-1 text-[10px] font-bold text-brand-gray/50">تعديل مباشر</span></div>
            <MetaRow label="العميل">{ticket.customer ? <AppLink to={`/customers/${ticket.customer.id}`} className="font-bold text-brand-primary hover:underline">{ticket.customer.name}</AppLink> : '—'}</MetaRow>
            <MetaRow label="القسم">{ticket.department?.name || '—'}</MetaRow>
            <MetaRow label="المسؤول">{ticket.assigned_agent?.name || <span className="text-brand-gray/40">غير مسندة</span>}</MetaRow>
            <MetaRow label="الحالة"><select value={ticket.status} onChange={(event) => patch('status', event.target.value)} className={SELECT_CLASS}>{TICKET_STATUSES.map((value) => <option key={value} value={value}>{TICKET_STATUS_LABELS[value]}</option>)}</select></MetaRow>
            <MetaRow label="الأولوية"><select value={ticket.priority} onChange={(event) => patch('priority', event.target.value)} className={SELECT_CLASS}>{PRIORITIES.map((value) => <option key={value} value={value}>{PRIORITY_LABELS[value]}</option>)}</select></MetaRow>
            <MetaRow label="الفئة"><select value={ticket.category?.id || ''} onChange={(event) => patch('ticket_category_id', event.target.value ? Number(event.target.value) : null)} className={SELECT_CLASS}><option value="">بدون فئة</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></MetaRow>
            <MetaRow label="المصدر">{SOURCE_LABELS[ticket.source] || ticket.source}</MetaRow>
            <MetaRow label="أنشأها">{ticket.created_by?.name || 'النظام'}</MetaRow>
            {ticket.resolved_at ? <MetaRow label="تاريخ الحل">{formatDate(ticket.resolved_at)}</MetaRow> : null}
            {ticket.closed_at ? <MetaRow label="تاريخ الإغلاق">{formatDate(ticket.closed_at)}</MetaRow> : null}
          </section>
        </aside>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { formatDate, slaBadgeClass, slaRemaining } from '../ticketLabels'

function SlaRow({ label, dueAt, breached, isClosed }) {
  const sla = slaRemaining(dueAt)

  if (!dueAt) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-brand-gray/60">{label}</span>
        <span className="text-xs font-bold text-brand-gray/40">لا توجد سياسة</span>
      </div>
    )
  }

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-brand-gray/60">{label}</span>
        {/* Once a ticket is resolved/closed the clock stops mattering, so
            it renders neutral rather than screaming red forever. */}
        {isClosed ? (
          <span className="rounded-full bg-brand-gray/8 px-2.5 py-0.5 text-[11px] font-bold text-brand-gray/60">منتهية</span>
        ) : (
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${slaBadgeClass(sla, breached)}`}>
            {breached ? 'تم التجاوز' : sla?.label}
          </span>
        )}
      </div>
      <span className="text-[11px] font-semibold text-brand-gray/50">{formatDate(dueAt)}</span>
    </div>
  )
}

export function TicketSlaCard({ ticket }) {
  const [, setTick] = useState(0)
  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed'

  // Re-render every 30s so the countdowns stay honest without a reload.
  // Cheap: it only bumps a counter, and stops once the ticket is done.
  useEffect(() => {
    if (isClosed) return undefined

    const timer = setInterval(() => setTick((value) => value + 1), 30000)

    return () => clearInterval(timer)
  }, [isClosed])

  return (
    <section className="grid gap-3 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
      <h3 className="m-0 text-sm font-black text-brand-navy">اتفاقية مستوى الخدمة</h3>

      <SlaRow
        label="موعد الاستجابة"
        dueAt={ticket.sla?.response_due_at}
        breached={ticket.sla?.response_breached}
        isClosed={isClosed || Boolean(ticket.sla?.first_response_at)}
      />

      <SlaRow
        label="موعد الحل"
        dueAt={ticket.sla?.resolution_due_at}
        breached={ticket.sla?.resolution_breached}
        isClosed={isClosed}
      />

      <div className="flex items-center justify-between gap-3 border-t border-brand-gray/10 pt-3">
        <span className="text-xs font-bold text-brand-gray/60">أول استجابة</span>
        <span className="text-[11px] font-semibold text-brand-gray/50">
          {ticket.sla?.first_response_at ? formatDate(ticket.sla.first_response_at) : 'لم تتم بعد'}
        </span>
      </div>
    </section>
  )
}

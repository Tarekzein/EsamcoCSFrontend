import { ChatInteractionCard } from './ChatInteractionCard'
import { TicketRelationshipActions } from './TicketRelationshipActions'

function SectionHeader({ title, description, count }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="grid gap-0.5"><h3 className="m-0 text-sm font-black text-brand-navy">{title}</h3><p className="m-0 text-[11px] font-semibold text-brand-gray/50">{description}</p></div>
      <span className="rounded-full bg-brand-gray/8 px-2.5 py-1 text-[10px] font-bold text-brand-gray/60">{count}</span>
    </div>
  )
}

export function TicketLinkedRecords({ ticket }) {
  const interactions = ticket.interactions || []
  const chats = interactions.filter((item) => item.channel === 'live_chat')
  const calls = interactions.filter((item) => item.channel === 'call')
  const emails = interactions.filter((item) => item.channel === 'email')

  return (
    <section className="grid gap-6 rounded-2xl border border-brand-gray/12 bg-white p-4 shadow-[0_12px_36px_rgba(17,45,95,0.06)] sm:p-5">
      <div className="grid gap-1"><h2 className="m-0 text-base font-black text-brand-navy">القنوات المرتبطة</h2><p className="m-0 text-xs font-semibold text-brand-gray/55">كل نقاط التواصل المرتبطة بهذه الحالة في مكان واحد.</p></div>
      <TicketRelationshipActions ticket={ticket} />

      <div className="grid gap-3">
        <SectionHeader title="المحادثات المباشرة" description="المحادثات التي أدت إلى هذه الحالة أو أضيفت لاحقاً" count={ticket.interaction_counts?.live_chat ?? chats.length} />
        {chats.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{chats.map((interaction) => <ChatInteractionCard key={interaction.id} interaction={interaction} />)}</div> : <p className="m-0 rounded-xl border border-dashed border-brand-gray/20 p-6 text-center text-xs font-bold text-brand-gray/45">لم تُربط أي محادثة حتى الآن.</p>}
      </div>

      <div className="grid gap-3 border-t border-brand-gray/8 pt-5">
        <SectionHeader title="المكالمات" description="مراجع المكالمات الحالية؛ التنقل سيتاح مع وحدة المكالمات" count={ticket.interaction_counts?.call ?? calls.length} />
        {calls.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{calls.map((call) => <article key={call.id} className="grid gap-2 rounded-xl border border-brand-gray/12 p-4"><strong className="text-sm text-brand-navy">{call.external_ref}</strong><span className="text-xs font-semibold text-brand-gray/55">مزود الخدمة: {call.provider || 'غير محدد'}</span><span className="rounded-lg bg-brand-gray/6 px-3 py-2 text-center text-[11px] font-bold text-brand-gray/45">وحدة المكالمات قريباً</span></article>)}</div> : <p className="m-0 text-xs font-bold text-brand-gray/40">لا توجد مكالمات مرتبطة.</p>}
      </div>

      <div className="grid gap-3 border-t border-brand-gray/8 pt-5">
        <SectionHeader title="البريد الإلكتروني" description="مراجع رسائل البريد القديمة المرتبطة بالحالة" count={ticket.interaction_counts?.email ?? emails.length} />
        {emails.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{emails.map((email) => <article key={email.id} className="grid gap-2 rounded-xl border border-brand-gray/12 p-4"><strong className="break-all text-sm text-brand-navy">{email.external_ref}</strong><span className="text-xs font-semibold text-brand-gray/55">{email.summary || 'سجل بريد قديم'}</span></article>)}</div> : <p className="m-0 text-xs font-bold text-brand-gray/40">لا توجد سجلات بريد مرتبطة.</p>}
      </div>
    </section>
  )
}

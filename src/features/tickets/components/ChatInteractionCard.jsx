import { AppLink } from '../../../router/AppLink'
import { currentPath } from '../../../router/navigation'

export function ChatInteractionCard({ interaction }) {
  const chat = interaction.conversation

  if (!chat) {
    return (
      <article className="grid min-h-40 content-center justify-items-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 text-center">
        <span aria-hidden className="grid size-9 place-items-center rounded-full bg-amber-100">!</span>
        <strong className="text-sm text-amber-900">محادثة غير متاحة</strong>
        <span className="text-xs font-semibold text-amber-800/70">قد تكون المحادثة قديمة أو محذوفة.</span>
      </article>
    )
  }

  return (
    <article className="group grid gap-4 rounded-xl border border-brand-gray/12 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-[0_12px_32px_rgba(17,45,95,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <strong className="text-sm text-brand-navy">{chat.visitor_name || 'زائر'}</strong>
          <span className="text-[11px] font-bold text-brand-gray/45">محادثة #{chat.id}</span>
        </div>
        <span className="rounded-full bg-brand-primary/7 px-2.5 py-1 text-[10px] font-bold text-brand-primary">{chat.status}</span>
      </div>

      <dl className="m-0 grid grid-cols-2 gap-3 rounded-lg bg-brand-gray/4 p-3 text-xs">
        <div className="grid gap-0.5"><dt className="font-bold text-brand-gray/45">المسؤول</dt><dd className="m-0 truncate font-semibold">{chat.assigned_agent?.name || 'غير مسندة'}</dd></div>
        <div className="grid gap-0.5"><dt className="font-bold text-brand-gray/45">الرسائل</dt><dd className="m-0 font-semibold">{chat.messages_count ?? 0}</dd></div>
        <div className="col-span-2 grid gap-0.5"><dt className="font-bold text-brand-gray/45">وقت البدء</dt><dd className="m-0 font-semibold">{chat.started_at ? new Date(chat.started_at).toLocaleString('ar-EG') : '—'}</dd></div>
      </dl>

      {interaction.can_open ? (
        <AppLink to={`/live-chat/${chat.id}`} state={{ from: currentPath() }} className="rounded-lg bg-brand-primary px-3 py-2 text-center text-xs font-black text-white transition hover:bg-brand-navy">
          فتح المحادثة
        </AppLink>
      ) : (
        <span className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-600">المحادثة غير متاحة للفتح</span>
      )}
    </article>
  )
}

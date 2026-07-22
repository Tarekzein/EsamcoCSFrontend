import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { avatarColor, initials } from '../../../lib/avatarColor'
import { timeAgoAr } from '../../../lib/formatRelativeAr'
import { AUTHOR_TYPE_LABELS } from '../ticketLabels'
import { addTicketComment } from '../ticketsSlice'
import { downloadTicketMedia } from '../ticketsAPI'

const COLLAPSE_THRESHOLD = 400

function CommentBody({ body }) {
  const [isExpanded, setExpanded] = useState(false)
  const isLong = body.length > COLLAPSE_THRESHOLD

  if (!isLong || isExpanded) {
    return (
      <>
        <p className="m-0 whitespace-pre-wrap text-sm font-semibold leading-6 text-brand-gray">{body}</p>
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="justify-self-start text-[11px] font-bold text-brand-primary hover:underline"
          >
            عرض أقل
          </button>
        ) : null}
      </>
    )
  }

  return (
    <>
      <p className="m-0 whitespace-pre-wrap text-sm font-semibold leading-6 text-brand-gray">
        {body.slice(0, COLLAPSE_THRESHOLD)}…
      </p>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="justify-self-start text-[11px] font-bold text-brand-primary hover:underline"
      >
        عرض المزيد
      </button>
    </>
  )
}

function CommentAttachments({ attachments = [] }) {
  if (!attachments.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((file) => (
        <button key={file.id} type="button" onClick={() => downloadTicketMedia(file.url, file.name)} className="text-xs font-bold text-brand-primary hover:underline">
          📎 {file.name}
        </button>
      ))}
    </div>
  )
}

function Comment({ comment }) {
  const isInternal = comment.visibility === 'internal'
  const isSystem = comment.author_type === 'system'
  const authorName = comment.user?.name || AUTHOR_TYPE_LABELS[comment.author_type] || 'النظام'

  // System comments (chat transcripts, mostly) are context rather than
  // conversation, so they're visually recessive.
  if (isSystem) {
    return (
      <li className="grid gap-1.5 rounded-lg border border-dashed border-brand-gray/20 bg-brand-gray/4 p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-brand-gray/50">
          <span>النظام</span>
          <span>·</span>
          <span>{timeAgoAr(comment.created_at)}</span>
          <span className="rounded-full bg-brand-gray/10 px-2 py-0.5">ملاحظة داخلية</span>
        </div>
        <CommentBody body={comment.body} />
        <CommentAttachments attachments={comment.attachments} />
      </li>
    )
  }

  return (
    <li
      className={`grid gap-1.5 rounded-lg border p-4 ${
        isInternal ? 'border-amber-200 bg-amber-50/60' : 'border-brand-gray/15 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-black ${avatarColor(authorName)}`}>
          {initials(authorName)}
        </div>
        <span className="text-xs font-bold text-brand-navy">{authorName}</span>
        <span className="text-[11px] font-semibold text-brand-gray/40">{timeAgoAr(comment.created_at)}</span>

        {isInternal ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">ملاحظة داخلية</span>
        ) : null}

        {comment.is_first_response ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">أول استجابة</span>
        ) : null}
      </div>

      <CommentBody body={comment.body} />
      <CommentAttachments attachments={comment.attachments} />
    </li>
  )
}

export function TicketCommentsThread({ ticket }) {
  const dispatch = useAppDispatch()
  const comments = useAppSelector((state) => state.tickets.comments)
  const commentsStatus = useAppSelector((state) => state.tickets.commentsStatus)
  const actionStatus = useAppSelector((state) => state.tickets.actionStatus)

  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [attachments, setAttachments] = useState([])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!body.trim()) return

    const action = await dispatch(addTicketComment({ id: ticket.id, body, visibility, attachments }))

    if (!action.error) {
      setBody('')
      setAttachments([])
      event.currentTarget.reset()
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
      <h3 className="m-0 text-sm font-black text-brand-navy">
        المحادثة والملاحظات
        {comments.length ? <span className="mr-2 text-xs font-bold text-brand-gray/50">({comments.length})</span> : null}
      </h3>

      {ticket.email_delivery_failures?.length ? (
        <div className="grid gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <strong className="text-xs text-red-800">فشل إرسال بعض إشعارات البريد</strong>
          {ticket.email_delivery_failures.map((failure) => (
            <p key={failure.id} className="m-0 text-xs font-semibold text-red-700">
              {failure.recipient} — {failure.attempts} محاولات — {failure.failure_details || 'خطأ غير معروف'}
            </p>
          ))}
        </div>
      ) : null}

      {commentsStatus === 'loading' ? (
        <p className="m-0 text-center text-sm font-bold text-brand-gray/50">جارٍ التحميل...</p>
      ) : comments.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-brand-gray/20 p-4 text-center text-sm font-bold text-brand-gray/40">
          لا توجد ردود أو ملاحظات بعد.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3 border-t border-brand-gray/10 pt-4">
        <textarea
          rows={3}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={visibility === 'internal' ? 'ملاحظة داخلية لا يراها العميل...' : 'اكتب ردك للعميل...'}
          className={`rounded-lg border px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/15 ${
            visibility === 'internal' ? 'border-amber-300 bg-amber-50/40' : 'border-brand-gray/15'
          }`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Defaults to public: an agent typing a reply expects the
              customer to see it. Internal has to be chosen deliberately. */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs font-bold text-brand-gray">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
              />
              رد عام
            </label>
            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <input
                type="radio"
                name="visibility"
                value="internal"
                checked={visibility === 'internal'}
                onChange={() => setVisibility('internal')}
              />
              ملاحظة داخلية (لا يراها العميل)
            </label>
          </div>

          <button
            type="submit"
            disabled={actionStatus === 'loading' || !body.trim()}
            className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-navy disabled:opacity-60"
          >
            {actionStatus === 'loading' ? 'جارٍ الإرسال...' : 'إرسال'}
          </button>
        </div>
        <label className="grid gap-1 text-xs font-bold text-brand-gray/70">
          مرفقات الرد (حتى 5 ملفات)
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            onChange={(event) => setAttachments(Array.from(event.target.files || []).slice(0, 5))}
          />
        </label>
      </form>
    </section>
  )
}

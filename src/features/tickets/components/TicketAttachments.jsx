import { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { addTicketAttachment, removeTicketAttachment } from '../ticketsSlice'
import { downloadTicketMedia } from '../ticketsAPI'

// Mirrors UploadTicketAttachmentRequest (max:10240 KB, mimes:...). Checked
// client-side too because Laravel's 422 comes back in English, which would
// be the only non-Arabic string a user ever sees.
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} بايت`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} كيلوبايت`

  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`
}

function isImage(mimeType) {
  return typeof mimeType === 'string' && mimeType.startsWith('image/')
}

export function TicketAttachments({ ticket }) {
  const dispatch = useAppDispatch()
  const actionStatus = useAppSelector((state) => state.tickets.actionStatus)
  const fileInputRef = useRef(null)
  const [localError, setLocalError] = useState(null)

  const attachments = ticket.attachments || []

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setLocalError(null)

    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setLocalError('نوع الملف غير مدعوم. الأنواع المسموحة: صور، PDF، وWord.')
      event.target.value = ''

      return
    }

    if (file.size > MAX_BYTES) {
      setLocalError('حجم الملف يتجاوز 10 ميجابايت.')
      event.target.value = ''

      return
    }

    await dispatch(addTicketAttachment({ id: ticket.id, file }))
    event.target.value = ''
  }

  async function handleDelete(media) {
    if (!window.confirm(`هل تريد حذف المرفق "${media.name}"؟`)) return

    await dispatch(removeTicketAttachment({ id: ticket.id, mediaId: media.id }))
  }

  return (
    <section className="grid gap-3 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-sm font-black text-brand-navy">
          المرفقات
          {attachments.length ? <span className="mr-2 text-xs font-bold text-brand-gray/50">({attachments.length})</span> : null}
        </h3>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={actionStatus === 'loading'}
          className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/8 disabled:opacity-60"
        >
          {actionStatus === 'loading' ? 'جارٍ الرفع...' : '+ إضافة مرفق'}
        </button>

        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
      </div>

      {localError ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{localError}</p>
      ) : null}

      {attachments.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-brand-gray/20 p-4 text-center text-xs font-bold text-brand-gray/40">
          لا توجد مرفقات.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-2 p-0">
          {attachments.map((media) => (
            <li key={media.id} className="flex items-center gap-3 rounded-lg border border-brand-gray/10 p-2.5">
              <span className="grid size-10 shrink-0 place-items-center rounded bg-brand-gray/8 text-base" aria-hidden>
                {isImage(media.mime_type) ? '🖼️' : '📄'}
              </span>

              <button
                type="button"
                onClick={() => downloadTicketMedia(media.url, media.name)}
                className="flex-1 truncate text-xs font-bold text-brand-primary hover:underline"
              >
                {media.name}
              </button>

              <span className="shrink-0 text-[11px] font-semibold text-brand-gray/50">{formatBytes(media.size)}</span>

              <button
                type="button"
                onClick={() => handleDelete(media)}
                className="shrink-0 rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-50"
              >
                حذف
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

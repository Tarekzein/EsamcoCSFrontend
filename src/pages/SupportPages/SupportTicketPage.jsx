import { useEffect, useState } from 'react'
import { createPublicReply, downloadPublicAttachment, fetchPublicTicket } from '../../features/support/supportAPI'
import { PublicSupportLayout } from './PublicSupportLayout'

function consumeToken(uuid) {
  const key = `support_ticket_token:${uuid}`
  const hashToken = new URLSearchParams(window.location.hash.slice(1)).get('token')
  if (hashToken) {
    sessionStorage.setItem(key, hashToken)
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`)
  }
  return hashToken || sessionStorage.getItem(key) || ''
}

export function SupportTicketPage({ uuid }) {
  const [token] = useState(() => consumeToken(uuid))
  const [ticket, setTicket] = useState(null)
  const [body, setBody] = useState('')
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState(token ? 'loading' : 'unauthorized')
  const [message, setMessage] = useState('')

  async function loadTicket() {
    if (!token) return
    setStatus('loading')
    try {
      const payload = await fetchPublicTicket(uuid, token)
      setTicket(payload.data)
      setStatus('ready')
    } catch (error) {
      setMessage(error.message)
      setStatus('unauthorized')
    }
  }

  useEffect(() => {
    if (!token) return

    fetchPublicTicket(uuid, token)
      .then((payload) => {
        setTicket(payload.data)
        setStatus('ready')
      })
      .catch((error) => {
        setMessage(error.message)
        setStatus('unauthorized')
      })
  }, [token, uuid])

  async function submitReply(event) {
    event.preventDefault()
    if (!body.trim()) return
    setStatus('saving')
    try {
      await createPublicReply(ticket.uuid, token, body, files)
      setBody('')
      setFiles([])
      await loadTicket()
    } catch (error) {
      setMessage(error.message)
      setStatus('ready')
    }
  }

  if (status === 'unauthorized') {
    return (
      <PublicSupportLayout>
        <section className="grid justify-items-center gap-4 rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <h1 className="m-0 text-xl font-black text-brand-navy">رابط الوصول غير صالح أو منتهي</h1>
          <p className="m-0 text-sm font-semibold text-brand-gray/65">{message || 'اطلب رابطاً جديداً باستخدام رقم التذكرة وبريدك الإلكتروني.'}</p>
          <a href="/support" className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-black text-white">طلب رابط جديد</a>
        </section>
      </PublicSupportLayout>
    )
  }

  return (
    <PublicSupportLayout>
      {!ticket ? <p className="rounded-xl bg-white p-8 text-center font-bold">جارٍ تحميل التذكرة...</p> : (
        <>
          <section className="grid gap-3 rounded-2xl border border-brand-gray/10 bg-white p-5 shadow-[0_12px_40px_rgba(17,45,95,0.07)] sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-black text-brand-primary">{ticket.ticket_number}</span><span className="rounded-full bg-brand-gray/8 px-3 py-1 text-xs font-bold">{ticket.status}</span></div>
            <h1 className="m-0 text-xl font-black text-brand-navy">{ticket.subject}</h1>
            <p className="m-0 whitespace-pre-wrap text-sm font-semibold leading-7">{ticket.description}</p>
            {ticket.attachments?.length ? <div className="flex flex-wrap gap-2">{ticket.attachments.map((file) => <button key={file.id} onClick={() => downloadPublicAttachment(file.download_path, token, file.name)} className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary">📎 {file.name}</button>)}</div> : null}
          </section>

          <section className="grid gap-4 rounded-2xl border border-brand-gray/10 bg-white p-5 shadow-[0_12px_40px_rgba(17,45,95,0.07)] sm:p-7">
            <h2 className="m-0 text-lg font-black text-brand-navy">سجل المراسلات</h2>
            {!ticket.replies?.length ? <p className="m-0 rounded-xl border border-dashed p-5 text-center text-sm font-bold text-brand-gray/45">لا توجد ردود بعد.</p> : (
              <ol className="m-0 grid list-none gap-3 p-0">{ticket.replies.map((reply) => <li key={reply.id} className={`grid gap-2 rounded-xl border p-4 ${reply.author_type === 'customer' ? 'border-brand-primary/20 bg-blue-50/40' : 'border-brand-gray/10'}`}><div className="flex justify-between gap-3 text-xs font-bold"><span>{reply.author_name}</span><time className="text-brand-gray/45">{new Date(reply.created_at).toLocaleString('ar-EG')}</time></div><p className="m-0 whitespace-pre-wrap text-sm font-semibold leading-6">{reply.body}</p>{reply.attachments?.map((file) => <button key={file.id} onClick={() => downloadPublicAttachment(file.download_path, token, file.name)} className="justify-self-start text-xs font-bold text-brand-primary">📎 {file.name}</button>)}</li>)}</ol>
            )}
            {message ? <p className="m-0 text-sm font-bold text-red-700">{message}</p> : null}
            <form onSubmit={submitReply} className="grid gap-3 border-t border-brand-gray/10 pt-4">
              <textarea required rows={4} value={body} onChange={(event) => setBody(event.target.value)} placeholder="اكتب ردك..." className="rounded-xl border border-brand-gray/15 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-primary/15" />
              <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 5))} className="text-xs font-bold" />
              <button disabled={status === 'saving'} className="justify-self-start rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-black text-white disabled:opacity-60">{status === 'saving' ? 'جارٍ الإرسال...' : 'إرسال الرد'}</button>
            </form>
          </section>
        </>
      )}
    </PublicSupportLayout>
  )
}

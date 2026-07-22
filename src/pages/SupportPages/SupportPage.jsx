import { useEffect, useState } from 'react'
import {
  createSupportTicket,
  fetchSupportDepartments,
  requestSupportAccessLink,
} from '../../features/support/supportAPI'
import { PublicSupportLayout } from './PublicSupportLayout'

const INPUT = 'rounded-xl border border-brand-gray/15 bg-white px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15'
const EMPTY_TICKET = { name: '', email: '', phone: '', subject: '', description: '', department_id: '' }

export function SupportPage() {
  const [departments, setDepartments] = useState([])
  const [ticket, setTicket] = useState(EMPTY_TICKET)
  const [attachments, setAttachments] = useState([])
  const [access, setAccess] = useState({ ticket_number: '', email: '' })
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchSupportDepartments()
      .then((payload) => setDepartments(payload.data || payload.departments || []))
      .catch(() => setDepartments([]))
  }, [])

  async function submitTicket(event) {
    event.preventDefault()
    setBusy(true)
    setFeedback(null)
    try {
      const payload = await createSupportTicket(ticket, attachments)
      setFeedback({ type: 'success', text: `${payload.message} رقم التذكرة: ${payload.data.ticket_number}` })
      setTicket(EMPTY_TICKET)
      setAttachments([])
      event.currentTarget.reset()
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }

  async function submitAccess(event) {
    event.preventDefault()
    setBusy(true)
    setFeedback(null)
    try {
      const payload = await requestSupportAccessLink(access.ticket_number, access.email)
      setFeedback({ type: 'success', text: payload.message })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <PublicSupportLayout>
      {feedback ? (
        <p className={`m-0 rounded-xl border px-4 py-3 text-sm font-bold ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {feedback.text}
        </p>
      ) : null}

      <section className="grid gap-5 rounded-2xl border border-brand-gray/10 bg-white p-5 shadow-[0_12px_40px_rgba(17,45,95,0.07)] sm:p-7">
        <div className="grid gap-1">
          <h1 className="m-0 text-xl font-black text-brand-navy">افتح تذكرة دعم</h1>
          <p className="m-0 text-sm font-semibold text-brand-gray/60">سنرسل رابطاً خاصاً إلى بريدك لمتابعة الردود وإضافة تحديثات.</p>
        </div>
        <form onSubmit={submitTicket} className="grid gap-4 sm:grid-cols-2">
          {[
            ['name', 'الاسم', 'text'],
            ['email', 'البريد الإلكتروني', 'email'],
            ['phone', 'رقم الهاتف (اختياري)', 'tel'],
            ['subject', 'موضوع المشكلة', 'text'],
          ].map(([field, label, type]) => (
            <label key={field} className="grid gap-1.5 text-sm font-bold text-brand-gray">
              {label}
              <input required={field !== 'phone'} type={type} value={ticket[field]} onChange={(event) => setTicket({ ...ticket, [field]: event.target.value })} className={INPUT} />
            </label>
          ))}
          <label className="grid gap-1.5 text-sm font-bold text-brand-gray">
            القسم
            <select required value={ticket.department_id} onChange={(event) => setTicket({ ...ticket, department_id: event.target.value })} className={INPUT}>
              <option value="">اختر القسم</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-brand-gray sm:col-span-2">
            وصف المشكلة
            <textarea required rows={6} value={ticket.description} onChange={(event) => setTicket({ ...ticket, description: event.target.value })} className={INPUT} />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-brand-gray sm:col-span-2">
            المرفقات (حتى 5 ملفات، 10 MB لكل ملف)
            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" onChange={(event) => setAttachments(Array.from(event.target.files || []).slice(0, 5))} className={INPUT} />
          </label>
          <button disabled={busy} className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-black text-white transition hover:bg-brand-navy disabled:opacity-60 sm:col-span-2">
            {busy ? 'جارٍ الإرسال...' : 'إرسال طلب الدعم'}
          </button>
        </form>
      </section>

      <section className="grid gap-4 rounded-2xl border border-brand-gray/10 bg-white p-5 shadow-[0_12px_40px_rgba(17,45,95,0.07)] sm:p-7">
        <h2 className="m-0 text-lg font-black text-brand-navy">أرسل لي رابط دخول جديد</h2>
        <form onSubmit={submitAccess} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="grid gap-1.5 text-sm font-bold">رقم التذكرة<input required value={access.ticket_number} onChange={(event) => setAccess({ ...access, ticket_number: event.target.value })} className={INPUT} /></label>
          <label className="grid gap-1.5 text-sm font-bold">البريد الإلكتروني<input required type="email" value={access.email} onChange={(event) => setAccess({ ...access, email: event.target.value })} className={INPUT} /></label>
          <button disabled={busy} className="rounded-xl border border-brand-primary px-5 py-2.5 text-sm font-black text-brand-primary transition hover:bg-brand-primary hover:text-white disabled:opacity-60">إرسال الرابط</button>
        </form>
      </section>
    </PublicSupportLayout>
  )
}

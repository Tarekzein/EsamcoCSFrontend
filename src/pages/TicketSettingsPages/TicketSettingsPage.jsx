import { useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { SlaPoliciesTab } from '../../features/tickets/components/SlaPoliciesTab'
import { TicketCategoriesTab } from '../../features/tickets/components/TicketCategoriesTab'

const TABS = [
  { key: 'sla', label: 'سياسات SLA' },
  { key: 'categories', label: 'فئات التذاكر' },
]

export function TicketSettingsPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const [tab, setTab] = useState('sla')

  // The sidebar already hides this entry for non-admins, but a pasted URL
  // would still render it - and every endpoint behind it is role:admin, so
  // the page would just be a wall of 403s.
  if (currentUser?.role !== 'admin') {
    return (
      <div dir="rtl">
        <p className="m-0 rounded-lg border border-brand-gray/15 bg-white p-6 text-center text-sm font-bold text-brand-gray/60">
          هذه الصفحة متاحة لمسؤولي النظام فقط.
        </p>
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <div className="rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <h1 className="m-0 mb-3 text-lg font-black text-brand-navy">إعدادات التذاكر</h1>

        <div className="flex gap-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                tab === item.key
                  ? 'bg-brand-primary text-white'
                  : 'border border-brand-gray/15 text-brand-gray hover:bg-brand-gray/8'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'sla' ? <SlaPoliciesTab /> : <TicketCategoriesTab />}
    </div>
  )
}

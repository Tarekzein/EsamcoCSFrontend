const NOTE_TONE_CLASSES = {
  emerald: 'text-emerald-600',
  blue: 'text-brand-primary',
  amber: 'text-amber-600',
}

export function DashboardHero({ eyebrow = 'ESAMCO CRM', title, description }) {
  return (
    <div className="rounded-lg border border-brand-gray/15 bg-white p-8 shadow-[0_18px_50px_rgba(17,45,95,0.08)] max-sm:p-5">
      <p className="m-0 text-sm font-black tracking-[2px] text-brand-primary">{eyebrow}</p>
      <h1 className="mt-3 mb-2 text-[36px] leading-tight font-black text-brand-navy max-sm:text-[28px]">{title}</h1>
      <p className="m-0 max-w-2xl text-base leading-7 font-semibold text-brand-gray">{description}</p>
    </div>
  )
}

export function StatCard({ label, value, note, tone = 'blue' }) {
  return (
    <article className="rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_14px_35px_rgba(17,45,95,0.06)]">
      <p className="m-0 text-sm font-bold text-brand-gray">{label}</p>
      <strong className="mt-3 block text-3xl font-black text-brand-navy">{value}</strong>
      {note ? <span className={`mt-2 block text-sm font-bold ${NOTE_TONE_CLASSES[tone]}`}>{note}</span> : null}
    </article>
  )
}

export function StatGrid({ children }) {
  return <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">{children}</div>
}

export function DashboardPageShell({ children }) {
  return (
    <section className="mx-auto mt-10 grid max-w-6xl gap-6 text-right" dir="rtl">
      {children}
    </section>
  )
}

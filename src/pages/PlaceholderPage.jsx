export function PlaceholderPage({ title }) {
  return (
    <section className="mx-auto mt-10 grid max-w-3xl gap-4 text-right" dir="rtl">
      <div className="rounded-lg border border-brand-gray/15 bg-white p-10 text-center shadow-[0_18px_50px_rgba(17,45,95,0.08)]">
        <p className="m-0 text-sm font-black tracking-[2px] text-brand-primary">ESAMCO CRM</p>
        <h1 className="mt-3 mb-2 text-2xl font-black text-brand-navy">{title}</h1>
        <p className="m-0 text-base font-semibold text-brand-gray">هذا القسم قيد الإنشاء وسيتوفر قريباً.</p>
      </div>
    </section>
  )
}

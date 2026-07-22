import { AppLink } from '../router/AppLink'

export function NotFoundPage() {
  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="grid max-w-lg justify-items-center gap-4 rounded-2xl border border-brand-gray/10 bg-white p-8 text-center shadow-[0_18px_55px_rgba(17,45,95,0.08)]">
        <span className="text-5xl font-black text-brand-primary/25">404</span>
        <h1 className="m-0 text-xl font-black text-brand-navy">الصفحة غير موجودة</h1>
        <p className="m-0 text-sm font-semibold text-brand-gray/60">ربما تغيّر الرابط أو لم تعد لديك صلاحية الوصول إليه.</p>
        <AppLink to="/dashboard" className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-black text-white transition hover:bg-brand-navy">
          العودة إلى لوحة التحكم
        </AppLink>
      </section>
    </main>
  )
}

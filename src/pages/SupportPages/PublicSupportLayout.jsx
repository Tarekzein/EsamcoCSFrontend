import logo from '../../assets/logo-color.png'

export function PublicSupportLayout({ children }) {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 text-brand-gray sm:px-6 lg:py-12">
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-gray/10 bg-white px-5 py-4 shadow-[0_12px_40px_rgba(17,45,95,0.07)]">
          <a href="/support" className="flex items-center gap-3">
            <img src={logo} alt="Esamco" className="h-10 w-auto" />
            <span className="text-sm font-black text-brand-navy">بوابة الدعم الفني</span>
          </a>
          <span className="text-xs font-bold text-brand-gray/55">تواصل آمن مع فريق خدمة العملاء</span>
        </header>
        {children}
      </div>
    </main>
  )
}

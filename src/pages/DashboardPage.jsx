export function DashboardPage() {
  return (
    <section className="mx-auto mt-10 grid max-w-6xl gap-6 text-right" dir="rtl">
      <div className="rounded-lg border border-[#e5eaf1] bg-white p-8 shadow-[0_18px_50px_rgba(17,45,95,0.08)] max-sm:p-5">
        <p className="m-0 text-sm font-black tracking-[2px] text-[#1c55b6]">ESAMCO CRM</p>
        <h1 className="mt-3 mb-2 text-[36px] leading-tight font-black text-[#101828] max-sm:text-[28px]">
          مرحباً بك في لوحة التحكم
        </h1>
        <p className="m-0 max-w-2xl text-base leading-7 font-semibold text-[#667085]">
          تم تسجيل الدخول بنجاح. يمكنك الآن متابعة وإدارة دعم العملاء بسهولة من مساحة واحدة منظمة.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        <article className="rounded-lg border border-[#e5eaf1] bg-white p-5 shadow-[0_14px_35px_rgba(17,45,95,0.06)]">
          <p className="m-0 text-sm font-bold text-[#667085]">العملاء النشطون</p>
          <strong className="mt-3 block text-3xl font-black text-[#101828]">360</strong>
          <span className="mt-2 block text-sm font-bold text-emerald-600">جاهز للمتابعة</span>
        </article>
        <article className="rounded-lg border border-[#e5eaf1] bg-white p-5 shadow-[0_14px_35px_rgba(17,45,95,0.06)]">
          <p className="m-0 text-sm font-bold text-[#667085]">التذاكر المفتوحة</p>
          <strong className="mt-3 block text-3xl font-black text-[#101828]">24</strong>
          <span className="mt-2 block text-sm font-bold text-[#1c55b6]">تحتاج مراجعة</span>
        </article>
        <article className="rounded-lg border border-[#e5eaf1] bg-white p-5 shadow-[0_14px_35px_rgba(17,45,95,0.06)]">
          <p className="m-0 text-sm font-bold text-[#667085]">متوسط الاستجابة</p>
          <strong className="mt-3 block text-3xl font-black text-[#101828]">8 د</strong>
          <span className="mt-2 block text-sm font-bold text-amber-600">ضمن النطاق</span>
        </article>
      </div>
    </section>
  )
}

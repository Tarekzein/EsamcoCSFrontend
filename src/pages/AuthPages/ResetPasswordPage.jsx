import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate } from '../../router/navigation'
import { submitNewPassword } from '../../features/auth/authSlice'

function Logo() {
  return (
    <a
      className="absolute top-9 left-9 z-10 inline-flex items-center gap-2.5 text-[#5e646f] no-underline [direction:ltr] max-lg:top-6 max-lg:left-6 max-sm:top-4 max-sm:left-4"
      href="/login"
      aria-label="ESAMCO Group"
    >
      <span className="grid size-[58px] place-items-center rounded-[8px_20px_8px_20px] bg-linear-to-br from-[#56b8ff] via-[#0f5fd3] to-[#001f82] text-[42px] leading-none font-black text-white shadow-[0_10px_20px_rgba(18,82,188,0.22)] max-sm:size-10 max-sm:text-3xl">
        E
      </span>
      <span className="grid gap-1 text-left tracking-[8px] max-sm:tracking-[5px]">
        <strong className="text-[34px] leading-none font-bold max-sm:text-[22px]">ESAMCO</strong>
        <small className="inline-flex items-center justify-center gap-2 text-[17px] leading-none font-bold before:h-0.5 before:w-12 before:bg-[#777d87] after:h-0.5 after:w-12 after:bg-[#777d87] max-sm:text-[11px] max-sm:before:w-6 max-sm:after:w-6">
          GROUP
        </small>
      </span>
    </a>
  )
}

function BackButton() {
  function handleBack() {
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/login'

    if (currentPath !== '/login' && currentPath !== '/') {
      navigate('/login')
      return
    }

    if (window.history.length > 1) {
      window.history.back()
    }
  }

  return (
    <button
      type="button"
      className="absolute top-9 right-9 z-10 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d8e0ec] bg-white/85 px-4 text-sm font-black text-[#344054] shadow-[0_10px_25px_rgba(17,45,95,0.08)] transition hover:-translate-y-px hover:border-[#1c55b6]/30 hover:bg-white hover:text-[#1c55b6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c55b6] max-lg:top-6 max-lg:right-6 max-sm:top-4 max-sm:right-4"
      onClick={handleBack}
      aria-label="رجوع"
    >
      <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>رجوع</span>
    </button>
  )
}

function LockIllustration() {
  return (
    <svg className="mx-auto h-42 w-52" viewBox="0 0 210 168" aria-hidden="true">
      <path d="M37 37c30-40 97-38 125 4 35 53-2 114-65 113-61-1-94-65-60-117Z" fill="#e4f8e8" />
      <path d="M68 83V67c0-28 18-48 43-48s43 20 43 48v16" fill="none" stroke="#22bd4f" strokeWidth="15" strokeLinecap="round" />
      <rect x="58" y="75" width="106" height="82" rx="18" fill="#22bd4f" />
      <circle cx="111" cy="112" r="14" fill="#fff" />
      <path d="M105 123h12l6 23H99l6-23Z" fill="#fff" />
      <circle cx="163" cy="132" r="30" fill="#36c760" stroke="#fff" strokeWidth="7" />
      <path d="m150 132 9 9 18-22" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PasswordToggle({ isVisible, onClick }) {
  return (
    <button
      type="button"
      className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full text-[#8c8c8c] transition hover:bg-[#f0f4fb] hover:text-[#1c55b6]"
      onClick={onClick}
      aria-label={isVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
    >
      <svg className="size-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        {!isVisible ? (
          <path d="M4 20 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        ) : null}
      </svg>
    </button>
  )
}

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return (
    <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-right text-base leading-relaxed font-bold text-red-700">
      {children}
    </p>
  )
}

function FormAlert({ children, tone = 'error' }) {
  if (!children) {
    return null
  }

  const toneClass =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-transparent bg-transparent text-[#667085]'

  return <p className={`m-0 rounded-lg border px-4 py-3 text-center text-base leading-relaxed font-bold ${toneClass}`}>{children}</p>
}

function Shell({ children }) {
  return (
    <main
      className="relative grid min-h-svh place-items-center overflow-hidden bg-[#eef3f8] px-6 py-16 font-[Tahoma,Arial,system-ui,sans-serif] text-[#101828] max-sm:px-3 max-sm:py-24"
      dir="rtl"
    >
      <Logo />
      <BackButton />
      <section className="grid min-h-[min(820px,calc(100svh-128px))] w-full max-w-[680px] content-center rounded-lg border border-[#e5eaf1] bg-white px-10 py-[74px] shadow-[0_22px_60px_rgba(17,45,95,0.1)] max-sm:min-h-0 max-sm:px-4 max-sm:py-10">
        {children}
      </section>
    </main>
  )
}

export function ResetPasswordPage() {
  const dispatch = useAppDispatch()
  const resetVerified = useAppSelector((state) => state.auth.resetVerified)
  const status = useAppSelector((state) => state.auth.status)
  const isSubmitting = status === 'loading'
  const [form, setForm] = useState({ password: '', passwordConfirmation: '' })
  const [isComplete, setIsComplete] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!resetVerified) {
      setError('يرجى التحقق من الكود أولاً.')
      return
    }

    if (form.password.length < 8) {
      setError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.')
      return
    }

    if (form.password !== form.passwordConfirmation) {
      setError('كلمة المرور وتأكيدها غير متطابقين.')
      return
    }

    setError('')

    try {
      await dispatch(submitNewPassword(form)).unwrap()
      setIsComplete(true)
    } catch (exception) {
      setError(exception.message)
    }
  }

  if (isComplete) {
    return (
      <Shell>
        <div className="mx-auto grid w-full max-w-[560px] justify-items-stretch gap-6 text-center max-sm:gap-5">
          <LockIllustration />
          <div className="grid gap-3 text-center">
            <span className="mx-auto w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
              تمت العملية
            </span>
            <h1 className="m-0 text-[34px] leading-tight font-black text-[#101828] max-sm:text-[28px]">
              تم تحديث كلمة المرور!
            </h1>
            <p className="m-0 text-base leading-7 font-semibold text-[#667085]">
              تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
            </p>
          </div>
          <button
            type="button"
            className="min-h-14 rounded-lg border-0 bg-[#1c55b6] px-6 text-lg font-black text-white shadow-[0_12px_24px_rgba(28,85,182,0.18)] transition hover:-translate-y-px hover:bg-[#0c3d94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c55b6]"
            onClick={() => navigate('/login')}
          >
            العودة إلى تسجيل الدخول
          </button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <form
        className="mx-auto grid w-full max-w-[560px] justify-items-stretch gap-6 text-center max-sm:gap-5"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-3 text-center">
          <span className="mx-auto w-fit rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-black text-[#1c55b6]">
            كلمة مرور جديدة
          </span>
          <h1 className="m-0 text-[34px] leading-tight font-black text-[#101828] max-sm:text-[28px]">
            إنشاء كلمة مرور جديدة
          </h1>
          <p className="m-0 text-base leading-7 font-semibold text-[#667085]">
            اختر كلمة مرور قوية لا تقل عن 8 أحرف.
          </p>
        </div>

        <div className="grid gap-2 text-right">
          <label className="text-base font-black text-[#344054]" htmlFor="new-password">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              className="min-h-14 w-full rounded-lg border border-[#d0d5dd] bg-white px-4 pl-16 text-right text-base font-semibold text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1c55b6] focus:ring-4 focus:ring-[#1c55b6]/10"
              id="new-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
            />
            <PasswordToggle
              isVisible={showPassword}
              onClick={() => setShowPassword((current) => !current)}
            />
          </div>
        </div>

        <div className="grid gap-2 text-right">
          <label className="text-base font-black text-[#344054]" htmlFor="password-confirmation">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <input
              className="min-h-14 w-full rounded-lg border border-[#d0d5dd] bg-white px-4 pl-16 text-right text-base font-semibold text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1c55b6] focus:ring-4 focus:ring-[#1c55b6]/10"
              id="password-confirmation"
              name="passwordConfirmation"
              type={showConfirmation ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.passwordConfirmation}
              onChange={(event) => updateField('passwordConfirmation', event.target.value)}
              placeholder="قم بتأكيد كلمة المرور"
            />
            <PasswordToggle
              isVisible={showConfirmation}
              onClick={() => setShowConfirmation((current) => !current)}
            />
          </div>
        </div>

        <FieldError>{error}</FieldError>
        {!resetVerified ? (
          <FormAlert tone="warning">
            يجب إدخال كود التحقق قبل حفظ كلمة المرور الجديدة.
          </FormAlert>
        ) : null}

        <button
          type="submit"
          className="min-h-14 rounded-lg border-0 bg-[#1c55b6] px-6 text-lg font-black text-white shadow-[0_12px_24px_rgba(28,85,182,0.18)] transition hover:-translate-y-px hover:bg-[#0c3d94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c55b6] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
        </button>
      </form>
    </Shell>
  )
}

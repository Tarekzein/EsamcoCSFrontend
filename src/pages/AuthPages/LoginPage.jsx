import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate } from '../../router/navigation'
import { loginUser } from '../../features/auth/authSlice'

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

function SupportIllustration() {
  return (
    <svg
      className="h-auto w-[min(82vw,560px)] max-lg:w-[min(100%,420px)]"
      viewBox="0 0 560 452"
      role="img"
      aria-label="دعم العملاء"
    >
      <ellipse cx="295" cy="280" rx="205" ry="130" fill="#e8f1ff" />
      <circle cx="520" cy="188" r="7" fill="#5b9bff" />
      <circle cx="70" cy="220" r="8" fill="#5b9bff" />
      <path d="M77 330c-14-46 14-81 35-61 16 15 3 38-35 61Z" fill="#2fa86a" />
      <path d="M110 330c-5-58 32-94 47-66 12 23-8 45-47 66Z" fill="#37be7d" />
      <path d="M130 334c16-49 56-64 61-34 4 24-20 37-61 34Z" fill="#1f9f62" />
      <path d="M91 334h74l-10 58H101l-10-58Z" fill="#d99525" />
      <path d="M88 328h80v14H88z" rx="7" fill="#e6b844" />
      <path d="M192 329h286l20 28H166l26-28Z" fill="#8ab7f7" />
      <rect x="212" y="201" width="230" height="145" rx="14" fill="#8ab7f7" />
      <rect x="227" y="216" width="200" height="112" rx="7" fill="#ffffff" />
      <path d="m260 276 35-35 48 21 38-52" fill="none" stroke="#91bbf7" strokeWidth="10" />
      <rect x="270" y="292" width="22" height="26" rx="4" fill="#72a7f2" />
      <rect x="307" y="274" width="22" height="44" rx="4" fill="#72a7f2" />
      <rect x="344" y="254" width="22" height="64" rx="4" fill="#72a7f2" />
      <path d="M219 188c8-89 149-92 158-3" fill="none" stroke="#064ec3" strokeWidth="24" />
      <path d="M212 206c0-20 13-38 29-38h12v82h-14c-15 0-27-18-27-44Z" fill="#0b63dc" />
      <path d="M356 168h13c16 0 29 18 29 38s-12 44-27 44h-15v-82Z" fill="#0b63dc" />
      <path d="M365 250c-20 28-58 34-90 18" fill="none" stroke="#0646aa" strokeWidth="11" strokeLinecap="round" />
      <path d="M94 130c28-40 93-40 120 0 27 40-5 91-60 91-13 0-26-3-37-8l-45 23 18-42c-20-18-21-43 4-64Z" fill="#a8c9ff" />
      <circle cx="127" cy="174" r="7" fill="#ffffff" />
      <circle cx="155" cy="174" r="7" fill="#ffffff" />
      <circle cx="183" cy="174" r="7" fill="#ffffff" />
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

export function LoginPage() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)
  const isSubmitting = status === 'loading'
  const [form, setForm] = useState({ login: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.login || !form.password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.')
      return
    }

    setError('')

    try {
      await dispatch(loginUser(form)).unwrap()

      navigate('/dashboard')
    } catch (exception) {
      setError(exception.message)
    }
  }

  return (
    <main
      className="relative grid min-h-svh overflow-hidden bg-[#eef3f8] font-[Tahoma,Arial,system-ui,sans-serif] text-[#101828] lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.92fr)]"
      dir="rtl"
    >
      <Logo />
      <BackButton />
      <section className="grid content-center justify-items-center gap-9 px-12 pt-36 pb-18 max-lg:min-h-0 max-lg:px-6 max-lg:pt-32 max-lg:pb-8">
        <div className="grid max-w-[460px] gap-4 text-center">
          <span className="mx-auto inline-flex w-fit rounded-full border border-[#1c55b6]/15 bg-white/70 px-4 py-2 text-sm font-black text-[#1c55b6]">
            ESAMCO Customer Support
          </span>
          <h1 className="m-0 text-[42px] leading-tight font-black text-[#050505] max-sm:text-[32px]">
            مرحباً بك!
          </h1>
          <p className="m-0 text-xl leading-8 font-bold text-[#667085] max-sm:text-[18px]">
            سجل الدخول للمتابعة و إدارة دعم العملاء بسهولة.
          </p>
        </div>
        <SupportIllustration />
        <div className="grid w-full max-w-[520px] grid-cols-3 gap-3 text-center max-sm:grid-cols-1">
          <div className="rounded-lg border border-[#d8e0ec] bg-white/75 px-4 py-3">
            <p className="m-0 text-sm font-bold text-[#667085]">متابعة</p>
            <strong className="text-lg text-[#101828]">فورية</strong>
          </div>
          <div className="rounded-lg border border-[#d8e0ec] bg-white/75 px-4 py-3">
            <p className="m-0 text-sm font-bold text-[#667085]">حماية</p>
            <strong className="text-lg text-[#101828]">مؤمنة</strong>
          </div>
          <div className="rounded-lg border border-[#d8e0ec] bg-white/75 px-4 py-3">
            <p className="m-0 text-sm font-bold text-[#667085]">إدارة</p>
            <strong className="text-lg text-[#101828]">منظمة</strong>
          </div>
        </div>
      </section>
      <section className="grid min-h-svh content-center border-r border-[#e5eaf1] bg-white px-[70px] pt-30 pb-16 max-lg:min-h-0 max-lg:border-r-0 max-lg:px-6 max-lg:py-10">
        <form className="mx-auto grid w-full max-w-[610px] gap-7 max-sm:gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2.5 text-right">
            <label className="text-[23px] font-black text-[#090909] max-sm:text-[19px]" htmlFor="login">
              البريد الإلكتروني
            </label>
            <input
              className="min-h-[72px] w-full rounded-[7px] border border-[#a9a9a9] bg-white px-5 text-right text-[21px] font-semibold text-[#111] outline-none transition-shadow placeholder:text-[#9a9a9a] focus:border-[#1c55b6] focus:ring-4 focus:ring-[#1c55b6]/10 max-sm:min-h-[58px] max-sm:text-lg"
              id="login"
              name="login"
              type="email"
              autoComplete="email"
              value={form.login}
              onChange={(event) => updateField('login', event.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>

          <div className="grid gap-2.5 text-right">
            <label className="text-[23px] font-black text-[#090909] max-sm:text-[19px]" htmlFor="password">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                className="min-h-[72px] w-full rounded-[7px] border border-[#a9a9a9] bg-white px-5 pl-16 text-right text-[21px] font-semibold text-[#111] outline-none transition-shadow placeholder:text-[#9a9a9a] focus:border-[#1c55b6] focus:ring-4 focus:ring-[#1c55b6]/10 max-sm:min-h-[58px] max-sm:text-lg"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder="أدخل كلمة المرور"
              />
              <PasswordToggle
                isVisible={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 max-sm:flex-col-reverse max-sm:items-start">
            <button
              type="button"
              className="border-0 bg-transparent p-0 text-lg font-bold text-[#1573ff]"
              onClick={() => navigate('/forgot-password')}
            >
              نسيت كلمة المرور؟
            </button>
            <label className="inline-flex items-center gap-2.5 text-lg font-bold text-[#161616]">
              <input
                className="size-7 accent-[#1c55b6]"
                type="checkbox"
                checked={form.remember}
                onChange={(event) => updateField('remember', event.target.checked)}
              />
              <span>تذكرني</span>
            </label>
          </div>

          <FieldError>{error}</FieldError>

          <button
            type="submit"
            className="min-h-[72px] rounded-[7px] border-0 bg-[#1c55b6] px-6 text-[25px] font-black text-white shadow-[0_12px_24px_rgba(28,85,182,0.18)] transition hover:-translate-y-px hover:bg-[#0c3d94] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 max-sm:min-h-[60px] max-sm:text-[21px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>

          <FormAlert tone="muted">
            تحتاج مساعدة؟{' '}
            <a className="text-[#1573ff] no-underline" href="mailto:support@esamco.com">
              تواصل مع الدعم
            </a>
          </FormAlert>
        </form>
      </section>
    </main>
  )
}

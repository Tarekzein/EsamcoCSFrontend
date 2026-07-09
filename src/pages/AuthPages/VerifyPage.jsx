import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate } from '../../router/navigation'
import { requestPasswordReset, verifyOtp } from '../../features/auth/authSlice'

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

function MailIllustration() {
  return (
    <svg className="mx-auto h-42 w-52" viewBox="0 0 210 168" aria-hidden="true">
      <path d="M42 42c26-43 95-42 122 0 32 50-1 113-62 112-65-1-93-59-60-112Z" fill="#e4f8e8" />
      <path d="m125 36 66-25-29 78-23-29-35-8 21-16Z" fill="#35d85d" />
      <rect x="42" y="76" width="126" height="78" rx="5" fill="#18bf49" />
      <path d="m42 76 63 43 63-43v78H42V76Z" fill="#35d85d" opacity=".7" />
      <path d="m42 154 63-48 63 48H42Z" fill="#18bf49" opacity=".9" />
      <rect x="76" y="48" width="66" height="48" rx="4" fill="#ffffff" />
      <circle cx="59" cy="74" r="17" fill="#18bf49" />
      <text x="59" y="81" textAnchor="middle" fontSize="21" fontWeight="900" fill="#fff">
        ✓
      </text>
    </svg>
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

const RESEND_COOLDOWN_SECONDS = 30

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function VerifyPage() {
  const dispatch = useAppDispatch()
  const email = useAppSelector((state) => state.auth.resetEmail)
  const otpExpiresAt = useAppSelector((state) => state.auth.otpExpiresAt)
  const status = useAppSelector((state) => state.auth.status)
  const isSubmitting = status === 'loading'
  const isResending = status === 'loading'
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [resendMessage, setResendMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const secondsLeft = otpExpiresAt ? Math.max(0, Math.round((otpExpiresAt - now) / 1000)) : 0
  const isExpired = otpExpiresAt !== null && secondsLeft <= 0

  useEffect(() => {
    if (cooldown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setCooldown((current) => current - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    if (!otpExpiresAt) {
      return
    }

    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [otpExpiresAt])

  async function handleResend() {
    if (!email || isResending || cooldown > 0) {
      return
    }

    setError('')
    setResendMessage('')

    try {
      await dispatch(requestPasswordReset(email)).unwrap()
      setResendMessage('تم إرسال كود جديد إلى بريدك الإلكتروني.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (exception) {
      setError(exception.message)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isExpired) {
      setError('انتهت صلاحية الكود. يرجى طلب كود جديد.')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('يرجى إدخال كود مكون من 6 أرقام.')
      return
    }

    setError('')

    try {
      await dispatch(verifyOtp(otp)).unwrap()
      navigate('/reset-password')
    } catch (exception) {
      setError(exception.message)
    }
  }

  return (
    <main
      className="relative grid min-h-svh place-items-center overflow-hidden bg-[#eef3f8] px-6 py-16 font-[Tahoma,Arial,system-ui,sans-serif] text-[#101828] max-sm:px-3 max-sm:py-24"
      dir="rtl"
    >
      <Logo />
      <BackButton />
      <section className="grid min-h-[min(820px,calc(100svh-128px))] w-full max-w-[680px] content-center rounded-lg border border-[#e5eaf1] bg-white px-10 py-[74px] shadow-[0_22px_60px_rgba(17,45,95,0.1)] max-sm:min-h-0 max-sm:px-4 max-sm:py-10">
        <form
          className="mx-auto grid w-full max-w-[560px] justify-items-stretch gap-6 text-center max-sm:gap-5"
          onSubmit={handleSubmit}
        >
          <MailIllustration />
          <div className="grid gap-3 text-center">
            <span className="mx-auto w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
              التحقق من الهوية
            </span>
            <h1 className="m-0 text-[34px] leading-tight font-black text-[#101828] max-sm:text-[28px]">
              تم إرسال الكود!
            </h1>
            <p className="m-0 text-base leading-7 font-semibold text-[#667085]">
              أدخل الكود المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني.
            </p>
            <strong className="rounded-lg border border-[#e5eaf1] bg-[#f8fafc] px-3 py-2 text-base text-[#344054]">
              {email || 'بريدك الإلكتروني'}
            </strong>
          </div>

          <div className="grid gap-2 text-right">
            <div className="flex items-center justify-between">
              <label className="text-base font-black text-[#344054]" htmlFor="otp">
                كود التحقق
              </label>
              {otpExpiresAt ? (
                <span
                  className={`text-sm font-black ${isExpired ? 'text-[#e02424]' : 'text-[#667085]'}`}
                >
                  {isExpired ? 'انتهت صلاحية الكود' : `ينتهي الكود خلال ${formatDuration(secondsLeft)}`}
                </span>
              ) : null}
            </div>
            <input
              className="min-h-14 w-full rounded-lg border border-[#d0d5dd] bg-white px-4 text-center text-2xl font-black tracking-[0.45em] text-[#101828] outline-none transition placeholder:text-right placeholder:text-base placeholder:font-semibold placeholder:tracking-normal placeholder:text-[#98a2b3] focus:border-[#1c55b6] focus:ring-4 focus:ring-[#1c55b6]/10"
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength="6"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                setError('')
              }}
              placeholder="أدخل الكود"
            />
          </div>

          <FieldError>{error}</FieldError>

          <button
            type="submit"
            className="min-h-14 rounded-lg border-0 bg-[#1c55b6] px-6 text-lg font-black text-white shadow-[0_12px_24px_rgba(28,85,182,0.18)] transition hover:-translate-y-px hover:bg-[#0c3d94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c55b6] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            disabled={isSubmitting || isExpired}
          >
            {isSubmitting ? 'جاري التحقق...' : 'إدخال'}
          </button>

          <FormAlert tone={resendMessage ? 'success' : 'muted'}>{resendMessage}</FormAlert>

          <FormAlert tone="muted">
            لم تستلم الكود؟{' '}
            <button
              type="button"
              className="border-0 bg-transparent p-0 font-black text-[#1c55b6] underline transition hover:text-[#0c3d94] disabled:cursor-not-allowed disabled:text-[#98a2b3] disabled:no-underline"
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
            >
              {isResending
                ? 'جاري الإرسال...'
                : cooldown > 0
                  ? `إعادة الإرسال (${cooldown})`
                  : 'إعادة إرسال الكود'}
            </button>
          </FormAlert>
        </form>
      </section>
    </main>
  )
}

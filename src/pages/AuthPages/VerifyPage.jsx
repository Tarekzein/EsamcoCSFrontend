import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate } from '../../router/navigation'
import {
  AuthShell,
  FieldError,
  FormAlert,
  MailIllustration,
} from '../../features/auth/AuthShell'
import { requestPasswordReset, verifyOtp } from '../../features/auth/authSlice'

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
    <AuthShell variant="card">
      <form
        className="mx-auto grid w-full max-w-[560px] justify-items-stretch gap-6 text-center max-sm:gap-5"
        onSubmit={handleSubmit}
      >
        <MailIllustration tone="green" />
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
    </AuthShell>
  )
}

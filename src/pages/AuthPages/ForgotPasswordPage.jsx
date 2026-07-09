import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate } from '../../router/navigation'
import {
  AuthShell,
  FieldError,
  FormAlert,
  MailIllustration,
} from '../../features/auth/AuthShell'
import { requestPasswordReset } from '../../features/auth/authSlice'

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)
  const isSubmitting = status === 'loading'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني.')
      return
    }

    setError('')

    try {
      await dispatch(requestPasswordReset(email)).unwrap()
      navigate('/verify')
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
        <MailIllustration />
        <div className="grid gap-3 text-center">
          <span className="mx-auto w-fit rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-black text-[#1c55b6]">
            استعادة الحساب
          </span>
          <h1 className="m-0 text-[34px] leading-tight font-black text-[#101828] max-sm:text-[28px]">
            نسيت كلمة المرور؟
          </h1>
          <p className="m-0 text-base leading-7 font-semibold text-[#667085]">
            إدخل بريدك الإلكتروني وسنرسل لك كود إعادة تعيين كلمة المرور.
          </p>
        </div>

        <div className="grid gap-2 text-right">
          <label className="text-base font-black text-[#344054]" htmlFor="email">
            البريد الإلكتروني
          </label>
          <input
            className="min-h-14 w-full rounded-lg border border-[#d0d5dd] bg-white px-4 text-right text-base font-semibold text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1c55b6] focus:ring-4 focus:ring-[#1c55b6]/10"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError('')
            }}
            placeholder="أدخل بريدك الإلكتروني"
          />
        </div>

        <FieldError>{error}</FieldError>

        <button
          type="submit"
          className="min-h-14 rounded-lg border-0 bg-[#1c55b6] px-6 text-lg font-black text-white shadow-[0_12px_24px_rgba(28,85,182,0.18)] transition hover:-translate-y-px hover:bg-[#0c3d94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c55b6] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إدخال'}
        </button>

        <FormAlert tone="muted">
          تحتاج مساعدة؟{' '}
          <a className="text-[#1c55b6] no-underline hover:text-[#0c3d94]" href="mailto:support@esamco.com">
            تواصل مع الدعم
          </a>
        </FormAlert>
      </form>
    </AuthShell>
  )
}

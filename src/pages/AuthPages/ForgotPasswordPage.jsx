import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate } from '../../router/navigation'
import {
  AuthShell,
  FieldError,
  FormAlert,
  MailIllustration,
} from '../../features/auth/components/AuthShell'
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
          <span className="mx-auto w-fit rounded-full bg-brand-accent/10 px-3 py-1 text-sm font-black text-brand-primary">
            استعادة الحساب
          </span>
          <h1 className="m-0 text-[34px] leading-tight font-black text-brand-navy max-sm:text-[28px]">
            نسيت كلمة المرور؟
          </h1>
          <p className="m-0 text-base leading-7 font-semibold text-brand-gray">
            إدخل بريدك الإلكتروني وسنرسل لك كود إعادة تعيين كلمة المرور.
          </p>
        </div>

        <div className="grid gap-2 text-right">
          <label className="text-base font-black text-brand-gray" htmlFor="email">
            البريد الإلكتروني
          </label>
          <input
            className="min-h-14 w-full rounded-lg border border-brand-gray/25 bg-white px-4 text-right text-base font-semibold text-brand-navy outline-none transition placeholder:text-brand-gray/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
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
          className="min-h-14 rounded-lg border-0 bg-brand-primary px-6 text-lg font-black text-white shadow-[0_12px_24px_rgba(28,85,182,0.18)] transition hover:-translate-y-px hover:bg-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إدخال'}
        </button>

        <FormAlert tone="muted">
          تحتاج مساعدة؟{' '}
          <a className="text-brand-primary no-underline hover:text-brand-navy" href="mailto:support@esamco.com">
            تواصل مع الدعم
          </a>
        </FormAlert>
      </form>
    </AuthShell>
  )
}

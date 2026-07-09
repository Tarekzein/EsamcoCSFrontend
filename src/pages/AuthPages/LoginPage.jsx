import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate } from '../../router/navigation'
import {
  AuthShell,
  FieldError,
  FormAlert,
  PasswordToggle,
} from '../../features/auth/AuthShell'
import { loginUser } from '../../features/auth/authSlice'

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
    <AuthShell>
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
    </AuthShell>
  )
}

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { navigate } from '../../router/navigation'
import {
  AuthShell,
  FieldError,
  FormAlert,
  LockIllustration,
  PasswordToggle,
} from '../../features/auth/AuthShell'
import { submitNewPassword } from '../../features/auth/authSlice'

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
      <AuthShell variant="card">
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
      </AuthShell>
    )
  }

  return (
    <AuthShell variant="card">
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
    </AuthShell>
  )
}

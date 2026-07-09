import { useAppDispatch, useAppSelector } from '../app/hooks'
import { loggedOut } from '../features/auth/authSlice'
import { navigate } from '../router/navigation'

function Logo() {
  return (
    <a
      className="inline-flex items-center gap-2.5 text-[#5e646f] no-underline [direction:ltr]"
      href="/login"
      aria-label="ESAMCO Group"
    >
      <span className="grid size-11 place-items-center rounded-[8px_16px_8px_16px] bg-linear-to-br from-[#56b8ff] via-[#0f5fd3] to-[#001f82] text-3xl leading-none font-black text-white shadow-[0_10px_20px_rgba(18,82,188,0.22)]">
        E
      </span>
      <span className="grid gap-0.5 text-left tracking-[5px]">
        <strong className="text-[22px] leading-none font-bold">ESAMCO</strong>
        <small className="inline-flex items-center justify-center gap-2 text-[11px] leading-none font-bold before:h-0.5 before:w-6 before:bg-[#777d87] after:h-0.5 after:w-6 after:bg-[#777d87]">
          GROUP
        </small>
      </span>
    </a>
  )
}

export function DashboardLayout({ children }) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  function handleLogout() {
    dispatch(loggedOut())
    navigate('/login')
  }

  return (
    <main className="min-h-svh bg-[#eef3f8] p-6 font-[Tahoma,Arial,system-ui,sans-serif] text-[#101828] max-sm:p-4">
      <header className="flex min-h-20 items-center justify-between gap-5 rounded-lg border border-[#e5eaf1] bg-white px-5 shadow-[0_18px_50px_rgba(17,45,95,0.08)] max-sm:flex-col max-sm:items-start max-sm:p-4">
        <Logo />
        <div className="flex items-center gap-3.5 font-extrabold max-sm:w-full max-sm:justify-between">
          <div className="grid text-right">
            <span className="text-sm text-[#667085]">مرحباً</span>
            <span>{user?.name || 'لوحة التحكم'}</span>
          </div>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-[#1c55b6]/20 bg-white px-5 text-sm font-black text-[#1c55b6] transition hover:bg-[#eef4ff]"
            onClick={handleLogout}
          >
            تسجيل الخروج
          </button>
        </div>
      </header>
      {children}
    </main>
  )
}

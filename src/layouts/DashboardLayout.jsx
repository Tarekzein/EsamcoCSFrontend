import { useAppDispatch, useAppSelector } from '../app/hooks'
import { Logo } from '../features/auth/AuthShell'
import { loggedOut } from '../features/auth/authSlice'
import { navigate } from '../router/navigation'

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
        <Logo compact />
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

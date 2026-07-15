import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { loadCurrentUser, logoutUser, toggleOnlineStatus } from '../features/auth/authSlice'
import { useLiveChatDepartmentChannel } from '../features/liveChat/useLiveChatDepartmentChannel'
import { navigate } from '../router/navigation'
import { MenuIcon } from './navIcons'
import { Sidebar } from './Sidebar'

const ROLE_LABELS = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  agent: 'Agent',
}

function OnlineToggle({ isOnline, onToggle, disabled }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isOnline}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
        isOnline
          ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
          : 'border-brand-gray/15 bg-brand-gray/5 text-brand-gray/70 hover:bg-brand-gray/10'
      }`}
    >
      <span className={`size-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-brand-gray/40'}`} />
      {isOnline ? 'متصل' : 'غير متصل'}
    </button>
  )
}

function Avatar({ name }) {
  const initials =
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-accent via-brand-primary to-brand-navy text-sm font-black text-white ring-2 ring-brand-gray/10">
      {initials}
    </div>
  )
}

export function DashboardLayout({ children, currentPath, pageTitle = 'Dashboard' }) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isTogglingOnline, setTogglingOnline] = useState(false)

  useLiveChatDepartmentChannel(currentPath)

  // Self-heals sessions whose cached user (from an older login, before a
  // field like department_id existed on the API) is missing data the app
  // now depends on - e.g. for scoping the live-chat realtime channel.
  useEffect(() => {
    dispatch(loadCurrentUser())
  }, [dispatch])

  async function handleLogout() {
    await dispatch(logoutUser())
    navigate('/login')
  }

  async function handleToggleOnline() {
    setTogglingOnline(true)
    try {
      await dispatch(toggleOnlineStatus(!user?.is_online)).unwrap()
    } catch {
      // Transient failure - the switch just stays at its last known state.
    } finally {
      setTogglingOnline(false)
    }
  }

  const roleLabel = (user?.role && ROLE_LABELS[user.role]) || user?.role || ''

  return (
    <div dir="rtl" className="flex min-h-svh bg-brand-surface font-sans text-brand-navy">
      <Sidebar
        currentPath={currentPath}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-6 max-sm:p-4">
        <header className="flex min-h-20 items-center gap-3 rounded-lg border border-brand-gray/15 bg-white px-5 shadow-[0_18px_50px_rgba(17,45,95,0.08)]">
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-brand-gray/15 text-brand-gray transition hover:bg-brand-gray/6 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="فتح القائمة"
          >
            <MenuIcon className="size-5" />
          </button>

          <h1 className="m-0 min-w-0 flex-1 truncate text-lg font-black text-brand-navy">{pageTitle}</h1>

          <div className="flex shrink-0 items-center gap-3">
            <OnlineToggle isOnline={!!user?.is_online} onToggle={handleToggleOnline} disabled={isTogglingOnline} />
            <div className="hidden text-right sm:grid">
              <span className="text-sm font-black text-brand-navy">{user?.name || 'المستخدم'}</span>
              <span className="text-xs font-bold text-brand-gray/60">{roleLabel}</span>
            </div>
            <Avatar name={user?.name} />
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

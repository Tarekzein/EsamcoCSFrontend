import { useAppSelector } from '../app/hooks'
import { selectLiveChatUnreadTotal } from '../features/liveChat/liveChatSlice'
import { navigate, navItemsForRole } from '../router/navigation'
import { ChevronLeftIcon, LogoutIcon } from './navIcons'

export function Sidebar({ currentPath, isOpen, onClose, onLogout }) {
  const role = useAppSelector((state) => state.auth.user?.role)
  const liveChatUnreadTotal = useAppSelector(selectLiveChatUnreadTotal)
  const navItems = navItemsForRole(role)

  function handleNavigate(path) {
    navigate(path)
    onClose?.()
  }

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="إغلاق القائمة"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 shrink-0 flex-col bg-[#052B70] text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center gap-2.5 px-6 py-8">
          <span className="grid size-11 place-items-center rounded-[8px_16px_8px_16px] bg-linear-to-br from-brand-accent via-brand-primary to-brand-navy text-2xl leading-none font-black">
            E
          </span>
          <span className="grid gap-0.5 text-left tracking-[3px] [direction:ltr]">
            <strong className="text-lg leading-none font-black">ESAMCO</strong>
            <small className="text-[10px] leading-none font-bold text-white/50">GROUP</small>
          </span>
        </div>

        <div className="mx-5 mb-3 h-px bg-white/10" />

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-4">
          {navItems.map((item) => {
            const isActive = currentPath === item.path
            const Icon = item.icon
            const unreadCount = item.path === '/live-chat' ? liveChatUnreadTotal : 0

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-right text-sm font-bold transition ${
                  isActive
                    ? 'bg-brand-accent text-white shadow-[0_10px_25px_rgba(47,95,219,0.35)]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {unreadCount > 0 ? (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-red-500 text-[10px] font-black text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null}
                {!isActive && unreadCount === 0 ? <ChevronLeftIcon className="size-4 shrink-0 text-white/30" /> : null}
              </button>
            )
          })}
        </nav>

        <div className="mx-5 my-3 h-px bg-white/10" />

        <button
          type="button"
          onClick={onLogout}
          className="mx-4 mb-6 flex items-center gap-3 rounded-lg px-4 py-3 text-right text-sm font-bold text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          <LogoutIcon className="size-5 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>
    </>
  )
}

import {
  AuditIcon,
  BellIcon,
  BookIcon,
  ChartIcon,
  ChatIcon,
  DepartmentIcon,
  HomeIcon,
  PhoneIcon,
  SettingsIcon,
  TicketIcon,
  UsersIcon,
} from '../layouts/navIcons'

export const NAVIGATION_EVENT = 'app:navigate'

export function currentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

export function navigate(path, { replace = false, state = {}, scroll = true } = {}) {
  window.history[replace ? 'replaceState' : 'pushState'](state, '', path)
  window.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, { detail: { path } }))

  if (scroll) window.scrollTo({ top: 0, behavior: 'instant' })
}

export function goBack(fallback = '/dashboard') {
  if (window.history.state?.from) {
    window.history.back()
  } else {
    navigate(fallback, { replace: true })
  }
}

// `roles` gates what shows in the sidebar for the current user. Kept in
// sync with the backend route middleware in Modules/Users/routes/api.php
// and Modules/LiveChat/routes/api.php:
// - /api/users (index) -> role:admin|supervisor|agent (supervisors/agents
//   are scoped server-side to their own department - see
//   UserService::listUsers()).
// - /api/departments (index) -> any authenticated role.
// - /api/audit-logs -> role:admin|supervisor.
const ALL_ROLES = ['admin', 'supervisor', 'agent']

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'لوحة التحكم', title: 'Dashboard', icon: HomeIcon, roles: ALL_ROLES },
  { path: '/tickets', label: 'التذاكر', title: 'Tickets', icon: TicketIcon, roles: ALL_ROLES },
  // Ticket categories + SLA policies. Admin-only, matching the backend
  // (ticket-category writes and the sla-policies apiResource are both
  // role:admin in Modules/Ticket/routes/api.php).
  { path: '/ticket-settings', label: 'إعدادات التذاكر', title: 'Ticket Settings', icon: SettingsIcon, roles: ['admin'] },
  { path: '/live-chat', label: 'الدردشة المباشرة', title: 'Live Chat', icon: ChatIcon, roles: ALL_ROLES },
  { path: '/calls', label: 'المكالمات', title: 'Calls', icon: PhoneIcon, roles: ALL_ROLES },
  { path: '/customers', label: 'العملاء', title: 'Customers', icon: UsersIcon, roles: ALL_ROLES },
  { path: '/users', label: 'المستخدمون', title: 'Users', icon: UsersIcon, roles: ['admin', 'supervisor', 'agent'] },
  { path: '/departments', label: 'الأقسام', title: 'Departments', icon: DepartmentIcon, roles: ALL_ROLES },
  { path: '/audit-logs', label: 'سجلات التدقيق', title: 'Audit Logs', icon: AuditIcon, roles: ['admin', 'supervisor'] },
  { path: '/knowledge-base', label: 'المعرفة', title: 'Knowledge Base', icon: BookIcon, roles: ALL_ROLES },
  { path: '/reports', label: 'التقارير', title: 'Reports', icon: ChartIcon, roles: ALL_ROLES },
  { path: '/notifications', label: 'الإشعارات', title: 'Notifications', icon: BellIcon, roles: ALL_ROLES },
  { path: '/settings', label: 'الإعدادات', title: 'Settings', icon: SettingsIcon, roles: ALL_ROLES },
]

export function navItemsForRole(role) {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))
}

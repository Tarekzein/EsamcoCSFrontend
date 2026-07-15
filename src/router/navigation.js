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

export function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new Event('popstate'))
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
  { path: '/live-chat', label: 'الدردشة المباشرة', title: 'Live Chat', icon: ChatIcon, roles: ['supervisor', 'agent'] },
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

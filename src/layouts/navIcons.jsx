function Icon({ children, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export function HomeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z" />
    </Icon>
  )
}

export function TicketIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      <path d="M13 6v2M13 11v2M13 16v2" />
    </Icon>
  )
}

export function ChatIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </Icon>
  )
}

export function PhoneIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6.5 3h2.7l1.6 4.3-2 1.7a12.5 12.5 0 0 0 6.2 6.2l1.7-2 4.3 1.6v2.7a1.8 1.8 0 0 1-2 1.8A17.5 17.5 0 0 1 4.7 5a1.8 1.8 0 0 1 1.8-2Z" />
    </Icon>
  )
}

export function UsersIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19c.8-3.2 3.2-5 6.2-5s5.4 1.8 6.2 5" />
      <path d="M15.5 5.3a3.2 3.2 0 0 1 0 6M18 19c-.5-2.1-1.6-3.6-3.2-4.5" />
    </Icon>
  )
}

export function BookIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 6.5c-1.6-1.3-3.8-2-6.5-2A1.5 1.5 0 0 0 4 6v11c0 .8.7 1.4 1.5 1.3 2.5-.2 4.6.4 6 1.7 1.4-1.3 3.5-1.9 6-1.7.8.1 1.5-.5 1.5-1.3V6a1.5 1.5 0 0 0-1.5-1.5c-2.7 0-4.9.7-6.5 2Z" />
      <path d="M12 6.5V19" />
    </Icon>
  )
}

export function ChartIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 19V10M10 19V5M16 19v-7M4 19h16" />
    </Icon>
  )
}

export function BellIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 10a6 6 0 1 1 12 0c0 3.5 1 5 1.5 6H4.5C5 15 6 13.5 6 10Z" />
      <path d="M10.3 20a1.7 1.7 0 0 0 3.4 0" />
    </Icon>
  )
}

export function SettingsIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.8-1.4-2-3.4-2.1.6a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.3a7.6 7.6 0 0 0-2.6 1.5l-2.1-.6-2 3.4L4.6 10.5a7.6 7.6 0 0 0 0 3l-1.8 1.4 2 3.4 2.1-.6a7.6 7.6 0 0 0 2.6 1.5L10 21.5h4l.5-2.3a7.6 7.6 0 0 0 2.6-1.5l2.1.6 2-3.4-1.8-1.4Z" />
    </Icon>
  )
}

export function DepartmentIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M15 21v-9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v9" />
      <path d="M3 21h18M8 8h.01M8 12h.01M12 8h.01M12 12h.01" />
    </Icon>
  )
}

export function AuditIcon(props) {
  return (
    <Icon {...props}>
      <path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M9 7h6M9 11h6M9 15h3" />
    </Icon>
  )
}

export function MailIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="m3.5 6.8 8 5.6 8-5.6" />
    </Icon>
  )
}

export function ClockIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Icon>
  )
}

export function LogoutIcon(props) {
  return (
    <Icon {...props}>
      <path d="M13 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M9 8l-4 4 4 4M5 12h12" />
    </Icon>
  )
}

export function ChevronLeftIcon(props) {
  return (
    <Icon {...props}>
      <path d="M15 6l-6 6 6 6" />
    </Icon>
  )
}

export function MenuIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}

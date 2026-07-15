function Icon({ children, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.3-4.3" />
    </Icon>
  )
}

export function MoreIcon(props) {
  return (
    <Icon {...props} strokeWidth="2.4">
      <circle cx="12" cy="5" r="0.9" fill="currentColor" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
      <circle cx="12" cy="19" r="0.9" fill="currentColor" />
    </Icon>
  )
}

export function PaperclipIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8 12.5V8a4 4 0 0 1 8 0v8a2.5 2.5 0 0 1-5 0V9" />
    </Icon>
  )
}

export function SendIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 3 10 14" />
      <path d="m21 3-7 18-4-7-7-4 18-7Z" />
    </Icon>
  )
}

export function SingleCheckIcon(props) {
  return (
    <Icon {...props} strokeWidth="2">
      <path d="M4 12.5 7.5 16 16 5.5" />
    </Icon>
  )
}

export function DoubleCheckIcon(props) {
  return (
    <Icon {...props} strokeWidth="2">
      <path d="M2 12.5 5.5 16 14 5.5" />
      <path d="M9 12.5 12.5 16 21 5.5" />
    </Icon>
  )
}

export function DocumentIcon(props) {
  return (
    <Icon {...props}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
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

export function AlertIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function TrashIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
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

export function ShuffleIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 6h3.5a4 4 0 0 1 3.2 1.6L15 15a4 4 0 0 0 3.2 1.6H21" />
      <path d="M18 4l3 3-3 3" />
      <path d="M4 18h3.5a4 4 0 0 0 3.2-1.6L11.5 14" />
      <path d="M18 20l3-3-3-3" />
    </Icon>
  )
}

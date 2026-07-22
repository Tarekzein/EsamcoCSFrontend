import { navigate } from './navigation'

export function AppLink({ to, replace = false, state, children, onClick, ...props }) {
  function handleClick(event) {
    onClick?.(event)

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }

    event.preventDefault()
    navigate(to, { replace, state })
  }

  return <a href={to} onClick={handleClick} {...props}>{children}</a>
}

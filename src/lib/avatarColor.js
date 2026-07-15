// Deterministic name -> color/initials, shared by every avatar circle in
// the app so the same person renders identically wherever they show up
// (conversation list, chat header, customers/users tables).

const AVATAR_COLORS = [
  'bg-brand-primary/15 text-brand-primary',
  'bg-violet-100 text-violet-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
  'bg-sky-100 text-sky-600',
]

export function avatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function initials(name) {
  if (!name) return '؟'
  const parts = name.trim().split(/\s+/)
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0]).toUpperCase()
}

import { navigate } from '../../router/navigation'

// Rendered while stats are still loading so the grid keeps its shape
// instead of the page jumping once the numbers land.
const PLACEHOLDER = '—'

function value(stats, key) {
  return stats ? String(stats[key] ?? 0) : PLACEHOLDER
}

/**
 * Maps the stats payload onto the existing StatCard contract
 * ({label, value, note, tone}), adding an onClick that drills through to
 * the matching filtered ticket list where the backend supports the filter.
 */
export function ticketStatCards(stats, role) {
  const cards = [
    {
      label: role === 'agent' ? 'تذاكري المفتوحة' : 'التذاكر المفتوحة',
      value: value(stats, 'total_open'),
      note: 'تحتاج متابعة',
      tone: 'blue',
      onClick: () => navigate('/tickets?status=open'),
    },
    {
      label: 'تجاوزات SLA',
      value: value(stats, 'total_breached'),
      note: 'تجاوزت المدة المحددة',
      tone: 'red',
      onClick: () => navigate('/tickets?breached=1'),
    },
    {
      label: 'قاربت على التجاوز',
      value: value(stats, 'due_soon'),
      note: 'خلال الساعة القادمة',
      tone: 'amber',
    },
    {
      label: 'تم حلها اليوم',
      value: value(stats, 'resolved_today'),
      note: 'إنجاز اليوم',
      tone: 'emerald',
    },
  ]

  // An agent's scope is their own assigned tickets, so `unassigned` is
  // always zero for them - a permanently-zero card is worse than no card.
  if (role !== 'agent') {
    cards.splice(1, 0, {
      label: 'غير المسندة',
      value: value(stats, 'unassigned'),
      note: 'بانتظار الإسناد',
      tone: 'amber',
      onClick: () => navigate('/tickets?unassigned=1'),
    })

    cards.push({
      label: 'مصعّدة',
      value: value(stats, 'escalated'),
      note: 'تحتاج تدخلاً',
      tone: 'red',
      onClick: () => navigate('/tickets?status=escalated'),
    })
  } else {
    cards.push({
      label: 'بانتظار العميل',
      value: value(stats, 'pending_customer'),
      note: 'بانتظار رد العميل',
      tone: 'amber',
      onClick: () => navigate('/tickets?status=pending_customer'),
    })
  }

  return cards
}

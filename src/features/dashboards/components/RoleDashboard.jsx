import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { loadTicketStats } from '../../tickets/ticketsSlice'
import { ticketStatCards } from '../ticketStatCards'
import { DashboardHero, DashboardPageShell, StatCard, StatGrid } from './DashboardWidgets'

/**
 * Shared body for all three role dashboards. The stats endpoint is already
 * scoped server-side, so the only per-role difference is which cards make
 * sense to show (see ticketStatCards).
 */
export function RoleDashboard({ role }) {
  const dispatch = useAppDispatch()
  const hero = useAppSelector((state) => state.dashboards.heroByRole[role])
  const stats = useAppSelector((state) => state.tickets.stats)
  const statsStatus = useAppSelector((state) => state.tickets.statsStatus)

  // The tickets channel also refreshes these on ticket events (debounced),
  // so this is just the initial load.
  useEffect(() => {
    dispatch(loadTicketStats())
  }, [dispatch])

  const cards = ticketStatCards(stats, role)

  return (
    <DashboardPageShell>
      <DashboardHero title={hero.title} description={hero.description} />

      {statsStatus === 'failed' ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">
          تعذر تحميل الإحصائيات.
        </p>
      ) : null}

      <StatGrid>
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </StatGrid>
    </DashboardPageShell>
  )
}

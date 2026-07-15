import { useAppSelector } from '../../../app/hooks'
import { DashboardHero, DashboardPageShell, StatCard, StatGrid } from './DashboardWidgets'

export function AdminDashboard() {
  const { hero, stats } = useAppSelector((state) => state.dashboards.statsByRole.admin)

  return (
    <DashboardPageShell>
      <DashboardHero title={hero.title} description={hero.description} />

      <StatGrid>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </StatGrid>
    </DashboardPageShell>
  )
}

import { useAppSelector } from '../../../app/hooks'
import { DashboardHero, DashboardPageShell, StatCard, StatGrid } from './DashboardWidgets'

export function AgentDashboard() {
  const { hero, stats } = useAppSelector((state) => state.dashboards.statsByRole.agent)

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

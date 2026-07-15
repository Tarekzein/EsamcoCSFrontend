import { useAppSelector } from '../../app/hooks'
import { AdminDashboard } from '../../features/dashboards/components/AdminDashboard'
import { AgentDashboard } from '../../features/dashboards/components/AgentDashboard'
import { SuperVisiorDashboard } from '../../features/dashboards/components/SuperVisiorDashboard'

const ROLE_DASHBOARDS = {
  admin: AdminDashboard,
  supervisor: SuperVisiorDashboard,
  agent: AgentDashboard,
}

export function DashboardPage() {
  const role = useAppSelector((state) => state.auth.user?.role)
  const Dashboard = ROLE_DASHBOARDS[role] || AgentDashboard

  return <Dashboard />
}

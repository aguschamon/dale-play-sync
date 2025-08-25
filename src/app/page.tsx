import DashboardKPIs from '@/components/dashboard/DashboardKPIs'
import PipelineOverview from '@/components/dashboard/PipelineOverview'
import RecentOpportunities from '@/components/dashboard/RecentOpportunities'
import UrgentAlerts from '@/components/dashboard/UrgentAlerts'

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dale-green">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Gestión centralizada de oportunidades de sincronización musical
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Última actualización</p>
          <p className="text-sm text-white">Hace 5 minutos</p>
        </div>
      </div>

      {/* KPIs */}
      <DashboardKPIs />
      
      {/* Pipeline Overview */}
      <PipelineOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Opportunities */}
        <RecentOpportunities />
        
        {/* Urgent Alerts */}
        <UrgentAlerts />
      </div>
    </div>
  )
}

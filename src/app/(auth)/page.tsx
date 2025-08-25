import DashboardKPIs from '@/components/dashboard/DashboardKPIs'
import PipelineOverview from '@/components/dashboard/PipelineOverview'

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          Resumen ejecutivo del negocio de sincronización musical
        </p>
      </div>

      {/* KPIs */}
      <DashboardKPIs />

      {/* Pipeline Overview */}
      <div className="px-2 sm:px-0">
        <PipelineOverview />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dale-purple bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-dale-purple text-xl sm:text-2xl font-bold">🎵</span>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-2">15</div>
          <div className="text-gray-400 text-sm sm:text-base">Obras en Catálogo</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dale-emerald bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-dale-emerald text-xl sm:text-2xl font-bold">💰</span>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-2">$850K</div>
          <div className="text-gray-400 text-sm sm:text-base">Revenue Total</div>
        </div>

        <div className="card text-center sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dale-amber bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-dale-amber text-xl sm:text-2xl font-bold">⚡</span>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-2">4</div>
          <div className="text-gray-400 text-sm sm:text-base">Alertas Urgentes</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mx-2 sm:mx-0">
        <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-dale-navy-lighter rounded-lg">
            <div className="w-2 h-2 bg-dale-purple rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm sm:text-base">Nueva oportunidad creada</div>
              <div className="text-gray-400 text-xs sm:text-sm">Stranger Things Season 5 - Netflix</div>
            </div>
            <div className="text-gray-400 text-xs sm:text-sm flex-shrink-0">Hace 2 horas</div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-dale-navy-lighter rounded-lg">
            <div className="w-2 h-2 bg-dale-emerald rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm sm:text-base">Oportunidad pagada</div>
              <div className="text-gray-400 text-xs sm:text-sm">iPhone 15 Launch - Apple</div>
            </div>
            <div className="text-gray-400 text-xs sm:text-sm flex-shrink-0">Hace 1 día</div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-dale-navy-lighter rounded-lg">
            <div className="w-2 h-2 bg-dale-amber rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm sm:text-base">Deadline próximo</div>
              <div className="text-gray-400 text-xs sm:text-sm">Super Bowl 2025 - Heineken</div>
            </div>
            <div className="text-gray-400 text-xs sm:text-sm flex-shrink-0">Hace 3 días</div>
          </div>
        </div>
      </div>
    </div>
  )
}

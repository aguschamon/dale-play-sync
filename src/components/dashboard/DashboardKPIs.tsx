'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Target, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalOpportunities: number
  totalBudget: number
  totalRevenue: number
  conversionRate: number
  avgDealTime: number
  inboundCount: number
  urgentOpportunities: number
  activeOpportunities: number
}

export default function DashboardKPIs() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-dale-navy-lighter rounded-lg"></div>
            </div>
            <div className="h-8 bg-dale-navy-lighter rounded mb-2"></div>
            <div className="h-4 bg-dale-navy-lighter rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Error al cargar KPIs</h2>
        <p className="text-gray-400">No se pudieron cargar las estadísticas del dashboard</p>
      </div>
    )
  }

  const kpis = [
    {
      name: 'Revenue YTD',
      value: formatCurrency(stats.totalRevenue),
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-dale-emerald'
    },
    {
      name: 'Oportunidades Activas',
      value: stats.activeOpportunities.toString(),
      change: '+3',
      changeType: 'positive',
      icon: Target,
      color: 'text-dale-blue'
    },
    {
      name: 'Tasa de Conversión',
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-dale-purple'
    },
    {
      name: 'Tiempo Promedio',
      value: `${stats.avgDealTime.toFixed(1)} días`,
      change: '-1.5 días',
      changeType: 'positive',
      icon: Clock,
      color: 'text-dale-amber'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <div key={index} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-opacity-10 ${kpi.color.replace('text-', 'bg-')}`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${kpi.color}`} />
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  kpi.changeType === 'positive' ? 'text-dale-emerald' : 'text-dale-red'
                }`}>
                  {kpi.change}
                </span>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-xl sm:text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-sm text-gray-400">{kpi.name}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

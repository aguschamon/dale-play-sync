'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Target, Music, Users, BarChart3, Settings, TrendingUp, AlertTriangle, CheckSquare
} from 'lucide-react'

interface NavigationStats {
  opportunities: number
  pipeline: number
  alerts: number
}

export default function Navigation() {
  const pathname = usePathname()
  const [stats, setStats] = useState<NavigationStats>({ opportunities: 0, pipeline: 0, alerts: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNavigationStats()
  }, [])

  const fetchNavigationStats = async () => {
    try {
      setIsLoading(true)
      const [opportunitiesRes, alertsRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch('/api/alerts')
      ])

      if (opportunitiesRes.ok && alertsRes.ok) {
        const opportunities = await opportunitiesRes.json()
        const alerts = await alertsRes.json()

        const activeOpportunities = opportunities.filter((opp: any) =>
          opp.estado !== 'PAID' && opp.estado !== 'REJECTED'
        ).length
        const urgentAlerts = alerts.alerts?.filter((alert: any) => alert.type === 'URGENT').length || 0

        setStats({
          opportunities: activeOpportunities,
          pipeline: activeOpportunities,
          alerts: urgentAlerts
        })
      }
    } catch (error) {
      console.error('Error fetching navigation stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Oportunidades', href: '/opportunities', icon: Target, badge: isLoading ? '...' : stats.opportunities.toString(), loading: isLoading },
    { name: 'Pipeline', href: '/pipeline', icon: TrendingUp, badge: isLoading ? '...' : stats.pipeline.toString(), loading: isLoading },
    { name: 'Catálogo', href: '/catalog', icon: Music },
    { name: 'Titulares', href: '/titulares', icon: Users },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Alertas', href: '/alerts', icon: AlertTriangle, badge: isLoading ? '...' : stats.alerts.toString(), urgent: stats.alerts > 0, loading: isLoading },
    { name: 'Aprobaciones', href: '/aprobaciones', icon: CheckSquare },
    { name: 'Reportes', href: '/reports', icon: BarChart3 },
    { name: 'Configuración', href: '/settings', icon: Settings }
  ]

  return (
    <nav className="w-64 bg-dale-navy-light border-r border-dale-navy-lighter h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dale Play</h1>
          <p className="text-gray-400 text-sm">Sync Center</p>
        </div>

        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-dale-purple text-white shadow-lg'
                    : 'text-gray-300 hover:bg-dale-navy-lighter hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.urgent 
                      ? 'bg-dale-red text-white animate-pulse' 
                      : item.loading
                      ? 'bg-dale-gray text-white'
                      : 'bg-dale-purple text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-dale-navy-lighter">
          <div className="text-center">
            <div className="w-12 h-12 bg-dale-purple rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="text-white font-medium">Sync Manager</div>
            <div className="text-gray-400 text-sm">sync@daleplay.com</div>
          </div>
        </div>
      </div>
    </nav>
  )
}

'use client'

import { AlertTriangle, Clock, DollarSign, User } from 'lucide-react'
import { formatDate, getDaysUntilDeadline } from '@/lib/utils'

export default function UrgentAlerts() {
  const urgentAlerts = [
    {
      id: 1,
      type: 'deadline',
      title: 'Deadline Crítico - Coca-Cola Super Bowl',
      description: 'La oportunidad INBOUND de Coca-Cola vence en 5 días',
      priority: 'critical',
      opportunity: 'OPP-2025-0006',
      deadline: '2025-01-25',
      syncManager: 'Carlos Ruiz'
    },
    {
      id: 2,
      type: 'approval',
      title: 'Aprobación Pendiente - Warner Bros',
      description: 'Se requiere aprobación legal para Batman 2',
      priority: 'high',
      opportunity: 'OPP-2025-0007',
      deadline: '2025-02-28',
      syncManager: 'Luis Fernández'
    },
    {
      id: 3,
      type: 'inbound',
      title: 'Nueva Solicitud INBOUND',
      description: 'Solicitud urgente de Spotify para campaña Q1',
      priority: 'critical',
      opportunity: 'OPP-2025-0013',
      deadline: '2025-01-30',
      syncManager: 'María González'
    },
    {
      id: 4,
      type: 'budget',
      title: 'Budget Excedido - Netflix',
      description: 'El budget de Stranger Things excede el límite',
      priority: 'medium',
      opportunity: 'OPP-2025-0001',
      deadline: '2025-02-15',
      syncManager: 'María González'
    }
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return Clock
      case 'approval':
        return User
      case 'inbound':
        return AlertTriangle
      case 'budget':
        return DollarSign
      default:
        return AlertTriangle
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-500/10'
      case 'high':
        return 'border-orange-500 bg-orange-500/10'
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10'
      default:
        return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'Crítico'
      case 'high':
        return 'Alto'
      case 'medium':
        return 'Medio'
      default:
        return 'Bajo'
    }
  }

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400'
      case 'high':
        return 'text-orange-400'
      case 'medium':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Alertas Urgentes</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
          {urgentAlerts.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {urgentAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type)
          const daysUntilDeadline = getDaysUntilDeadline(alert.deadline)
          
          return (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg border ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  alert.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  alert.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white text-sm">{alert.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      alert.priority === 'critical' ? 'bg-red-500 text-white' :
                      alert.priority === 'high' ? 'bg-orange-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {getPriorityText(alert.priority)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{alert.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500">{alert.opportunity}</span>
                      <span className="text-gray-500">{alert.syncManager}</span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-gray-500">Deadline</p>
                      <p className={`font-medium ${
                        daysUntilDeadline <= 3 ? 'text-red-400' :
                        daysUntilDeadline <= 7 ? 'text-orange-400' :
                        'text-gray-300'
                      }`}>
                        {daysUntilDeadline} días
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-dale-gray-light">
        <button className="w-full text-center text-dale-green hover:text-dale-green-light text-sm font-medium">
          Ver todas las alertas
        </button>
      </div>
    </div>
  )
}


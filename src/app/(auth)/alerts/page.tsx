'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, DollarSign, User, Calendar } from 'lucide-react'
import { Oportunidad, Cliente } from '@/types'

interface Alert {
  id: string
  type: 'URGENT' | 'WARNING' | 'INFO'
  title: string
  description: string
  opportunity?: Oportunidad
  createdAt: Date
  priority: number
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      
      // Obtener oportunidades para generar alertas
      const opportunitiesResponse = await fetch('/api/opportunities')
      if (!opportunitiesResponse.ok) throw new Error('Error fetching opportunities')
      const opportunities: Oportunidad[] = await opportunitiesResponse.json()

      // Generar alertas basadas en las oportunidades
      const generatedAlerts: Alert[] = []

      opportunities.forEach((opportunity) => {
        // Alertas por tipo de flow
        if (opportunity.tipo_flow === 'INBOUND') {
          generatedAlerts.push({
            id: `inbound-${opportunity.id}`,
            type: 'URGENT',
            title: 'Oportunidad INBOUND Requiere Atención Inmediata',
            description: `La oportunidad "${opportunity.proyecto}" es INBOUND y requiere aprobación urgente.`,
            opportunity,
            createdAt: new Date(opportunity.createdAt),
            priority: 1
          })
        }

        // Alertas por deadline
        if (opportunity.deadline) {
          const deadline = new Date(opportunity.deadline)
          const now = new Date()
          const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays < 0) {
            generatedAlerts.push({
              id: `deadline-${opportunity.id}`,
              type: 'URGENT',
              title: 'Deadline Vencido',
              description: `La oportunidad "${opportunity.proyecto}" tiene un deadline vencido.`,
              opportunity,
              createdAt: new Date(opportunity.createdAt),
              priority: 1
            })
          } else if (diffDays <= 3) {
            generatedAlerts.push({
              id: `deadline-warning-${opportunity.id}`,
              type: 'WARNING',
              title: 'Deadline Próximo',
              description: `La oportunidad "${opportunity.proyecto}" vence en ${diffDays} días.`,
              opportunity,
              createdAt: new Date(opportunity.createdAt),
              priority: 2
            })
          }
        }

        // Alertas por estado
        if (opportunity.estado === 'APPROVAL') {
          generatedAlerts.push({
            id: `approval-${opportunity.id}`,
            type: 'WARNING',
            title: 'Aprobación Pendiente',
            description: `La oportunidad "${opportunity.proyecto}" está esperando aprobación legal.`,
            opportunity,
            createdAt: new Date(opportunity.createdAt),
            priority: 2
          })
        }

        if (opportunity.estado === 'INVOICED') {
          generatedAlerts.push({
            id: `invoiced-${opportunity.id}`,
            type: 'INFO',
            title: 'Facturación Pendiente',
            description: `La oportunidad "${opportunity.proyecto}" está facturada y esperando pago.`,
            opportunity,
            createdAt: new Date(opportunity.createdAt),
            priority: 3
          })
        }
      })

      // Ordenar por prioridad y fecha
      generatedAlerts.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setAlerts(generatedAlerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'URGENT':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'WARNING':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'INFO':
        return <DollarSign className="w-5 h-5 text-blue-400" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'border-red-500 bg-red-500 bg-opacity-10'
      case 'WARNING':
        return 'border-yellow-500 bg-yellow-500 bg-opacity-10'
      case 'INFO':
        return 'border-blue-500 bg-blue-500 bg-opacity-10'
      default:
        return 'border-gray-500 bg-gray-500 bg-opacity-10'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Alta'
      case 2:
        return 'Media'
      case 3:
        return 'Baja'
      default:
        return 'Normal'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dale-green mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando alertas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Alertas del Sistema</h1>
          <p className="text-gray-400 mt-2">
            Monitorea las alertas urgentes y pendientes del sistema
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{alerts.length}</div>
            <div className="text-sm text-gray-400">Total Alertas</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-400">
              {alerts.filter(a => a.type === 'URGENT').length}
            </div>
            <div className="text-sm text-gray-400">Urgentes</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-400">
            {alerts.filter(a => a.type === 'URGENT').length}
          </div>
          <div className="text-sm text-gray-400">Alertas Urgentes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {alerts.filter(a => a.type === 'WARNING').length}
          </div>
          <div className="text-sm text-gray-400">Advertencias</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-400">
            {alerts.filter(a => a.type === 'INFO').length}
          </div>
          <div className="text-sm text-gray-400">Informativas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">
            {alerts.filter(a => a.opportunity?.tipo_flow === 'INBOUND').length}
          </div>
          <div className="text-sm text-gray-400">INBOUND Activos</div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Lista de Alertas</h3>
          <button
            onClick={fetchAlerts}
            className="btn-secondary text-sm"
          >
            Actualizar
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <AlertTriangle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No hay alertas activas
            </h3>
            <p className="text-gray-400">
              El sistema está funcionando normalmente sin alertas pendientes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{alert.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
                      
                      {alert.opportunity && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400">Cliente:</span>
                            <span className="text-white">{alert.opportunity.cliente?.nombre || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400">Budget:</span>
                            <span className="text-white">
                              {alert.opportunity.budget ? `$${alert.opportunity.budget.toLocaleString()}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400">Deadline:</span>
                            <span className="text-white">
                              {alert.opportunity.deadline ? new Date(alert.opportunity.deadline).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Estado:</span>
                            <span className="text-white">{alert.opportunity.estado}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-xs">
                    <div className="text-gray-400 mb-1">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.type === 'URGENT' ? 'bg-red-500 text-white' :
                      alert.type === 'WARNING' ? 'bg-yellow-500 text-black' :
                      'bg-blue-500 text-white'
                    }`}>
                      {getPriorityLabel(alert.priority)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


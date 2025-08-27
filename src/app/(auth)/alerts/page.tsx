'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, DollarSign, User, Calendar } from 'lucide-react'
import { Oportunidad, Cliente } from '@/types'

interface Alert {
  id: string
  type: 'urgent' | 'warning' | 'info'
  title: string
  description: string
  date: Date
  priority: 'Alta' | 'Media' | 'Baja'
  metadata: {
    client?: string
    budget?: number
    deadline?: Date
    status?: string
    opportunityId?: string
    opportunity?: any
  }
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
      
      // Obtener alertas desde la API
      const alertsResponse = await fetch('/api/alerts')
      if (!alertsResponse.ok) throw new Error('Error fetching alerts')
      const alertsData = await alertsResponse.json()
      
      setAlerts(alertsData.alerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <DollarSign className="w-5 h-5 text-blue-400" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-red-500 bg-red-500 bg-opacity-10'
      case 'warning':
        return 'border-yellow-500 bg-yellow-500 bg-opacity-10'
      case 'info':
        return 'border-blue-500 bg-blue-500 bg-opacity-10'
      default:
        return 'border-gray-500 bg-gray-500 bg-opacity-10'
    }
  }

  const getPriorityLabel = (priority: string) => {
    return priority || 'Normal'
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
              {alerts.filter(a => a.type === 'urgent').length}
            </div>
            <div className="text-sm text-gray-400">Urgentes</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-400">
            {alerts.filter(a => a.type === 'urgent').length}
          </div>
          <div className="text-sm text-gray-400">Alertas Urgentes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {alerts.filter(a => a.type === 'warning').length}
          </div>
          <div className="text-sm text-gray-400">Advertencias</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-400">
            {alerts.filter(a => a.type === 'info').length}
          </div>
          <div className="text-sm text-gray-400">Informativas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">
            {alerts.filter(a => a.metadata?.opportunity?.tipo_flow === 'INBOUND').length}
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
                className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alert.type)} overflow-hidden`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white mb-1 truncate">{alert.title}</h4>
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">{alert.description}</p>
                      
                      {alert.metadata && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="flex items-center space-x-2 min-w-0">
                            <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-400 flex-shrink-0">Cliente:</span>
                            <span className="text-white truncate">{alert.metadata.client || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <DollarSign className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-400 flex-shrink-0">Budget:</span>
                            <span className="text-white truncate">
                              {alert.metadata.budget ? `$${alert.metadata.budget.toLocaleString()}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-400 flex-shrink-0">Deadline:</span>
                            <span className="text-white truncate">
                              {alert.metadata.deadline ? new Date(alert.metadata.deadline).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-gray-400 flex-shrink-0">Estado:</span>
                            <span className="text-white truncate">{alert.metadata.status || 'N/A'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-xs">
                    <div className="text-gray-400 mb-1">
                      {new Date(alert.date).toLocaleDateString()}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.type === 'urgent' ? 'bg-red-500 text-white' :
                      alert.type === 'warning' ? 'bg-yellow-500 text-black' :
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


'use client'
import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, User, Target, AlertTriangle, CheckCircle, Clock, Globe } from 'lucide-react'
import { Oportunidad, Cliente } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OpportunityDetailModalProps {
  opportunity: Oportunidad | null
  isOpen: boolean
  onClose: () => void
}

export default function OpportunityDetailModal({ opportunity, isOpen, onClose }: OpportunityDetailModalProps) {
  const [clients, setClients] = useState<Cliente[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchClients()
    }
  }, [isOpen])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  if (!isOpen || !opportunity) return null

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PITCHING': 'status-pitching',
      'NEGOTIATION': 'status-negotiation',
      'APPROVAL': 'status-approval',
      'LEGAL': 'status-legal',
      'SIGNED': 'status-signed',
      'INVOICED': 'status-invoiced',
      'PAID': 'status-paid',
      'REJECTED': 'status-rejected'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PITCHING': 'Pitching',
      'NEGOTIATION': 'Negociación',
      'APPROVAL': 'Aprobación',
      'LEGAL': 'Legal',
      'SIGNED': 'Firmado',
      'INVOICED': 'Por Cobrar',
      'PAID': 'Pagado',
      'REJECTED': 'Rechazado'
    }
    return labels[status] || status
  }

  const getFlowTypeColor = (flow: string) => {
    return flow === 'INBOUND' ? 'flow-inbound' : 'flow-outbound'
  }

  const getFlowTypeLabel = (flow: string) => {
    return flow === 'INBOUND' ? 'INBOUND' : 'OUTBOUND'
  }

  const isUrgent = (opportunity: Oportunidad) => {
    // Solo marcar como urgente si no está rechazada o pagada
    if (opportunity.estado === 'REJECTED' || opportunity.estado === 'PAID') return false
    
    if (opportunity.tipo_flow === 'INBOUND') return true
    if (!opportunity.deadline) return false
    
    const now = new Date()
    const deadline = new Date(opportunity.deadline)
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours < 48
  }

  const getDeadlineStatus = () => {
    // No mostrar deadline status para oportunidades pagadas o rechazadas
    if (opportunity.estado === 'PAID' || opportunity.estado === 'REJECTED') {
      return { status: 'N/A', color: 'text-gray-400' }
    }
    
    if (!opportunity.deadline) return { status: 'Sin deadline', color: 'text-gray-400' }
    
    const now = new Date()
    const deadline = new Date(opportunity.deadline)
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'VENCIDO', color: 'text-dale-red' }
    if (diffDays <= 7) return { status: 'PRÓXIMO', color: 'text-dale-amber' }
    return { status: 'NORMAL', color: 'text-gray-400' }
  }

  const deadlineStatus = getDeadlineStatus()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dale-navy-light border border-dale-navy-lighter rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dale-navy-lighter">
          <div>
            <h2 className="text-2xl font-bold text-white">{opportunity.proyecto}</h2>
            <p className="text-gray-400 mt-1">{opportunity.codigo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dale-navy-lighter rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Flow */}
          <div className="flex flex-wrap gap-4">
            <span className={`status-badge ${getStatusColor(opportunity.estado)}`}>
              {getStatusLabel(opportunity.estado)}
            </span>
            <span className={`flow-badge ${getFlowTypeColor(opportunity.tipo_flow)}`}>
              {getFlowTypeLabel(opportunity.tipo_flow)}
            </span>
            {isUrgent(opportunity) && (
              <span className="urgent-badge">URGENTE</span>
            )}
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-dale-purple" />
                <div>
                  <div className="text-sm text-gray-400">Proyecto</div>
                  <div className="text-white font-medium">{opportunity.proyecto}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-dale-blue" />
                <div>
                  <div className="text-sm text-gray-400">Cliente</div>
                  <div className="text-white font-medium">
                    {opportunity.cliente?.nombre || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-dale-amber" />
                <div>
                  <div className="text-sm text-gray-400">Tipo de Proyecto</div>
                  <div className="text-white font-medium">{opportunity.tipo_proyecto}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-dale-emerald" />
                <div>
                  <div className="text-sm text-gray-400">Territorio</div>
                  <div className="text-white font-medium">{opportunity.territorio}</div>
                </div>
              </div>
            </div>

            {/* Financial and Timeline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-dale-emerald" />
                <div>
                  <div className="text-sm text-gray-400">Budget</div>
                  <div className="text-dale-emerald font-medium text-xl">
                    {opportunity.budget ? formatCurrency(opportunity.budget) : 'Sin budget'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-dale-amber" />
                <div>
                  <div className="text-sm text-gray-400">Deadline</div>
                  <div className="text-white font-medium">
                    {opportunity.deadline ? formatDate(opportunity.deadline) : 'Sin deadline'}
                  </div>
                  <div className={`text-sm ${deadlineStatus.color}`}>
                    {deadlineStatus.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-dale-red" />
                <div>
                  <div className="text-sm text-gray-400">MFN</div>
                  <div className="text-white font-medium">
                    {opportunity.mfn ? 'Sí' : 'No'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-dale-emerald" />
                <div>
                  <div className="text-sm text-gray-400">Duración Licencia</div>
                  <div className="text-white font-medium">{opportunity.duracion_licencia}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Detalles Adicionales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-2">Tipo de Uso</div>
                <div className="text-white">{opportunity.tipo_uso}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Creado</div>
                <div className="text-white">{formatDate(opportunity.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-dale-navy-lighter space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose()
              // Aquí podrías navegar a la página de edición
            }}
            className="btn-primary"
          >
            Editar Oportunidad
          </button>
        </div>
      </div>
    </div>
  )
}

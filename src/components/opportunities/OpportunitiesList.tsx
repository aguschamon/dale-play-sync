'use client'

import { useState } from 'react'
import { Edit, Trash2, MoreHorizontal, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Oportunidad, Cliente } from '@/types'
import { formatCurrency, formatDate, getUrgencyLevel } from '@/lib/utils'

interface OpportunitiesListProps {
  opportunities: Oportunidad[]
  clients: Cliente[]
  onEdit: (opportunity: Oportunidad) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
  onRowClick: (opportunity: Oportunidad) => void
  isLoading: boolean
}

export default function OpportunitiesList({ 
  opportunities, 
  clients, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onRowClick,
  isLoading 
}: OpportunitiesListProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PITCHING': return 'bg-blue-500'
      case 'NEGOTIATION': return 'bg-yellow-500'
      case 'APPROVAL': return 'bg-orange-500'
      case 'LEGAL': return 'bg-purple-500'
      case 'SIGNED': return 'bg-green-500'
      case 'INVOICED': return 'bg-indigo-500'
      case 'PAID': return 'bg-green-600'
      case 'REJECTED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PITCHING': return 'Pitching'
      case 'NEGOTIATION': return 'Negociación'
      case 'APPROVAL': return 'Aprobación'
      case 'LEGAL': return 'Legal'
      case 'SIGNED': return 'Firmado'
      case 'INVOICED': return 'Facturado'
      case 'PAID': return 'Pagado'
      case 'REJECTED': return 'Rechazado'
      default: return status
    }
  }

  const getFlowTypeColor = (flowType: string) => {
    return flowType === 'INBOUND' ? 'bg-red-500' : 'bg-blue-500'
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.nombre || 'Cliente no encontrado'
  }

  const getNextStatuses = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      'PITCHING': ['NEGOTIATION', 'REJECTED'],
      'NEGOTIATION': ['APPROVAL', 'LEGAL', 'REJECTED'],
      'APPROVAL': ['LEGAL', 'REJECTED'],
      'LEGAL': ['SIGNED', 'REJECTED'],
      'SIGNED': ['INVOICED'],
      'INVOICED': ['PAID'],
      'PAID': [],
      'REJECTED': ['PITCHING']
    }
    return transitions[currentStatus] || []
  }

  const isUrgent = (opportunity: Oportunidad) => {
    if (opportunity.tipo_flow === 'INBOUND') return true
    if (!opportunity.deadline) return false
    
    const now = new Date()
    const deadline = new Date(opportunity.deadline)
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours < 48
  }

  const handleRowClick = (opportunity: Oportunidad, e: React.MouseEvent) => {
    // No navegar si se hace click en botones o selects
    if ((e.target as HTMLElement).closest('button, select, input')) {
      return
    }
    onRowClick(opportunity)
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (opportunities.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 mb-4">
          <Clock className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          No hay oportunidades
        </h3>
        <p className="text-gray-400">
          Crea tu primera oportunidad para comenzar a gestionar sincronizaciones
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dale-gray-light">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                Oportunidad
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                Cliente
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                Estado
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                Flow
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                Budget
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                Deadline
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opportunity) => (
              <tr 
                key={opportunity.id} 
                className={`border-b border-dale-gray-light hover:bg-dale-gray-light transition-colors duration-200 cursor-pointer ${
                  isUrgent(opportunity) ? 'bg-red-900 bg-opacity-20' : ''
                }`}
                onClick={(e) => handleRowClick(opportunity, e)}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    {isUrgent(opportunity) && (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <div className="font-medium text-white">
                        {opportunity.proyecto}
                      </div>
                      <div className="text-sm text-gray-400">
                        {opportunity.codigo}
                      </div>
                      <div className="text-xs text-gray-500">
                        {opportunity.tipo_proyecto}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="py-4 px-4">
                  <div className="text-white">
                    {getClientName(opportunity.clienteId)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {opportunity.territorio}
                  </div>
                </td>
                
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(opportunity.estado)}`}>
                      {getStatusLabel(opportunity.estado)}
                    </span>
                  </div>
                </td>
                
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getFlowTypeColor(opportunity.tipo_flow)}`}>
                    {opportunity.tipo_flow}
                  </span>
                </td>
                
                <td className="py-4 px-4">
                  <div className="text-white font-medium truncate max-w-[120px]">
                    {formatCurrency(opportunity.budget || 0)}
                  </div>
                  {opportunity.mfn && (
                    <div className="text-xs text-dale-green">MFN</div>
                  )}
                </td>
                
                <td className="py-4 px-4">
                  {opportunity.deadline ? (
                    <div className="text-white">
                      {formatDate(opportunity.deadline)}
                    </div>
                  ) : (
                    <div className="text-gray-400">Sin deadline</div>
                  )}
                </td>
                
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {/* Cambio de Estado */}
                    <select
                      value={opportunity.estado}
                      onChange={(e) => onStatusChange(opportunity.id, e.target.value)}
                      className="bg-dale-gray border border-dale-gray-light text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-dale-green"
                    >
                      {getNextStatuses(opportunity.estado).map(status => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                    
                    {/* Editar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(opportunity)
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {/* Eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(opportunity.id)
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-dale-gray-light">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Mostrando {opportunities.length} oportunidades
          </span>
          <span>
            {opportunities.filter(opp => isUrgent(opp)).length} urgentes
          </span>
        </div>
      </div>
    </div>
  )
}

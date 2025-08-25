'use client'

import { STATUS_LABELS, STATUS_COLORS, FLOW_LABELS } from '@/lib/constants'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function RecentOpportunities() {
  const recentOpportunities = [
    {
      id: 1,
      codigo: 'OPP-2025-0001',
      proyecto: 'Serie Netflix - Stranger Things S5',
      cliente: 'Netflix',
      tipo_flow: 'OUTBOUND',
      estado: 'PITCHING',
      budget: 25000,
      deadline: '2025-02-15',
      syncManager: 'María González',
      updatedAt: '2025-01-20T10:30:00Z'
    },
    {
      id: 2,
      codigo: 'OPP-2025-0006',
      proyecto: 'Publicidad Coca-Cola - Super Bowl',
      cliente: 'Coca-Cola',
      tipo_flow: 'INBOUND',
      estado: 'APPROVAL',
      budget: 15000,
      deadline: '2025-01-25',
      syncManager: 'Carlos Ruiz',
      updatedAt: '2025-01-20T09:15:00Z',
      urgent: true
    },
    {
      id: 3,
      codigo: 'OPP-2025-0004',
      proyecto: 'Videojuego EA - FIFA 26',
      cliente: 'EA Games',
      tipo_flow: 'OUTBOUND',
      estado: 'NEGOTIATION',
      budget: 32000,
      deadline: '2025-03-01',
      syncManager: 'Ana Martínez',
      updatedAt: '2025-01-19T16:45:00Z'
    },
    {
      id: 4,
      codigo: 'OPP-2025-0007',
      proyecto: 'Película Warner - Batman 2',
      cliente: 'Warner Bros',
      tipo_flow: 'OUTBOUND',
      estado: 'LEGAL',
      budget: 55000,
      deadline: '2025-02-28',
      syncManager: 'Luis Fernández',
      updatedAt: '2025-01-19T14:20:00Z'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Oportunidades Recientes</h3>
        <button className="text-dale-green hover:text-dale-green-light text-sm font-medium">
          Ver todas
        </button>
      </div>
      
      <div className="space-y-3">
        {recentOpportunities.map((opp) => (
          <div 
            key={opp.id} 
            className={`p-4 rounded-lg border ${
              opp.urgent ? 'border-red-500/30 bg-red-500/10' : 'border-dale-gray-light bg-dale-gray-light'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-white">{opp.proyecto}</h4>
                  {opp.urgent && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                      URGENTE
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-1">{opp.cliente}</p>
                <p className="text-xs text-gray-500">{opp.syncManager}</p>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-dale-green">{formatCurrency(opp.budget)}</p>
                <p className="text-xs text-gray-400">{formatDate(opp.updatedAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[opp.estado]} text-white`}>
                  {STATUS_LABELS[opp.estado]}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  opp.tipo_flow === 'INBOUND' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {FLOW_LABELS[opp.tipo_flow]}
                </span>
              </div>
              
              {opp.deadline && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Deadline</p>
                  <p className={`text-xs font-medium ${
                    opp.urgent ? 'text-red-400' : 'text-gray-300'
                  }`}>
                    {formatDate(opp.deadline)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


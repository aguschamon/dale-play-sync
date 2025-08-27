'use client'
import { useState, useEffect } from 'react'
import { STATUS_LABELS, STATUS_COLORS, FLOW_LABELS, FLOW_COLORS } from '@/lib/constants'
import { Oportunidad } from '@/types'
import OpportunityDetailModal from '@/components/shared/OpportunityDetailModal'

interface PipelineColumn {
  status: string
  count: number
  opportunities: Oportunidad[]
}

export default function PipelineOverview() {
  const [pipelineData, setPipelineData] = useState<PipelineColumn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Oportunidad | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchPipelineData()
  }, [])

  const fetchPipelineData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/opportunities')
      if (response.ok) {
        const opportunities: Oportunidad[] = await response.json()
        // Solo mostrar oportunidades activas (no PAID)
        const activeOpportunities = opportunities.filter(opp => opp.estado !== 'PAID')
        const statuses = ['PITCHING', 'NEGOTIATION', 'APPROVAL', 'LEGAL', 'SIGNED', 'INVOICED']
        const columns: PipelineColumn[] = statuses.map(status => ({
          status,
          count: activeOpportunities.filter(opp => opp.estado === status).length,
          opportunities: activeOpportunities.filter(opp => opp.estado === status)
        }))
        setPipelineData(columns)
      }
    } catch (error) {
      console.error('Error fetching pipeline data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isUrgent = (opportunity: Oportunidad) => {
    if (opportunity.tipo_flow === 'INBOUND') return true
    if (!opportunity.deadline) return false
    
    const now = new Date()
    const deadline = new Date(opportunity.deadline)
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours < 48
  }

  const handleCardClick = (opportunity: Oportunidad) => {
    setSelectedOpportunity(opportunity)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOpportunity(null)
  }

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Pipeline de Oportunidades</h3>
        <div className="grid grid-cols-6 gap-4 overflow-x-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse min-w-[200px]">
              <div className="h-4 bg-dale-navy-lighter rounded mb-2"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-dale-navy-lighter rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Pipeline de Oportunidades</h3>
        
        {/* Desktop View */}
        <div className="hidden lg:grid grid-cols-6 gap-4">
          {pipelineData.map((column) => (
            <div key={column.status} className="text-center">
              <div className="mb-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium status-${column.status.toLowerCase()}`}>
                  {(STATUS_LABELS as any)[column.status] || column.status}
                </div>
                <div className="text-2xl font-bold text-white mt-2 leading-tight">{column.count}</div>
              </div>
              
              <div className="space-y-2">
                {column.opportunities.slice(0, 3).map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className={`card cursor-pointer p-3 mb-0 transition-all duration-200 hover:scale-105 ${
                      isUrgent(opportunity) ? 'urgent-badge' : 'bg-dale-navy-lighter'
                    }`}
                    onClick={() => handleCardClick(opportunity)}
                  >
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium text-white mb-1 line-clamp-2 leading-tight">
                          {opportunity.proyecto}
                        </div>
                        <div className="text-xs text-gray-400 leading-tight">
                          {opportunity.cliente?.nombre || 'Cliente N/A'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full flow-${opportunity.tipo_flow.toLowerCase()}`}>
                          {(FLOW_LABELS as any)[opportunity.tipo_flow] || opportunity.tipo_flow}
                        </span>
                        {opportunity.budget && (
                          <span className="text-xs text-dale-emerald font-medium truncate max-w-[80px] ml-2">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(opportunity.budget)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {column.opportunities.length > 3 && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-400">
                      +{column.opportunities.length - 3} más
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile/Tablet View - Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {pipelineData.map((column) => (
              <div key={column.status} className="min-w-[280px] flex-shrink-0">
                <div className="mb-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium status-${column.status.toLowerCase()}`}>
                    {(STATUS_LABELS as any)[column.status] || column.status}
                  </div>
                  <div className="text-xl font-bold text-white mt-2 leading-tight">{column.count}</div>
                </div>
                
                <div className="space-y-2">
                  {column.opportunities.slice(0, 3).map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className={`card cursor-pointer p-3 mb-0 transition-all duration-200 hover:scale-105 ${
                        isUrgent(opportunity) ? 'urgent-badge' : 'bg-dale-navy-lighter'
                      }`}
                      onClick={() => handleCardClick(opportunity)}
                    >
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm font-medium text-white mb-1 line-clamp-2 leading-tight">
                            {opportunity.proyecto}
                          </div>
                          <div className="text-xs text-gray-400 mb-2 leading-tight">
                            {opportunity.cliente?.nombre || 'Cliente N/A'}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full flow-${opportunity.tipo_flow.toLowerCase()}`}>
                            {(FLOW_LABELS as any)[opportunity.tipo_flow] || opportunity.tipo_flow}
                          </span>
                          {opportunity.budget && (
                            <span className="text-xs text-dale-emerald font-medium truncate max-w-[80px] ml-2">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(opportunity.budget)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {column.opportunities.length > 3 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-400">
                        +{column.opportunities.length - 3} más
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
}

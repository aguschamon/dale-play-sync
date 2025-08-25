'use client'
import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import {
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'
import { Oportunidad, Cliente } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import OpportunityDetailModal from '@/components/shared/OpportunityDetailModal'

interface PipelineColumn {
  id: string
  title: string
  color: string
  opportunities: Oportunidad[]
}

export default function PipelinePage() {
  const [columns, setColumns] = useState<PipelineColumn[]>([])
  const [clients, setClients] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Oportunidad | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [opportunitiesRes, clientsRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch('/api/clients')
      ])

      if (!opportunitiesRes.ok || !clientsRes.ok) {
        throw new Error('Error fetching data')
      }

      const opportunities: Oportunidad[] = await opportunitiesRes.json()
      const clientsData: Cliente[] = await clientsRes.json()

      // Solo mostrar oportunidades activas (no PAID)
      const activeOpportunities = opportunities.filter(opp => opp.estado !== 'PAID')
      
      // Cambiar "PAID" por "INVOICED" (Por Cobrar)
      const statuses = ['PITCHING', 'NEGOTIATION', 'APPROVAL', 'LEGAL', 'SIGNED', 'INVOICED']
      const pipelineColumns: PipelineColumn[] = statuses.map(status => ({
        id: status,
        title: getStatusLabel(status),
        color: getStatusColor(status),
        opportunities: activeOpportunities.filter(opp => opp.estado === status)
      }))

      setColumns(pipelineColumns)
      setClients(clientsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PITCHING': 'bg-blue-500',
      'NEGOTIATION': 'bg-yellow-500',
      'APPROVAL': 'bg-orange-500',
      'LEGAL': 'bg-purple-500',
      'SIGNED': 'bg-green-500',
      'INVOICED': 'bg-indigo-500'
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
      'INVOICED': 'Por Cobrar'
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
    // Solo marcar como urgente si no está rechazada
    if (opportunity.estado === 'REJECTED') return false
    
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeOpportunity = columns
        .flatMap(col => col.opportunities)
        .find(opp => opp.id === active.id)

      if (activeOpportunity) {
        const newStatus = over.id as string
        
        try {
          const response = await fetch(`/api/opportunities/${active.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })

          if (response.ok) {
            // Update local state
            setColumns(prevColumns => 
              prevColumns.map(col => ({
                ...col,
                opportunities: col.opportunities.filter(opp => opp.id !== active.id)
              })).map(col => 
                col.id === newStatus 
                  ? { ...col, opportunities: [...col.opportunities, activeOpportunity] }
                  : col
              )
            )
          }
        } catch (error) {
          console.error('Error updating opportunity status:', error)
        }
      }
    }

    setActiveId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dale-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando pipeline...</p>
        </div>
      </div>
    )
  }

  const totalOpportunities = columns.reduce((sum, col) => sum + col.opportunities.length, 0)
  const activeOpportunities = totalOpportunities // Todas las oportunidades en el pipeline son activas

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Pipeline de Oportunidades</h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Vista Kanban del flujo de trabajo activo
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-dale-navy-light rounded-lg">
              <Target className="w-4 h-4 text-dale-blue" />
              <span className="text-white font-medium">{totalOpportunities}</span>
              <span className="text-gray-400 text-sm">Total</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-dale-navy-light rounded-lg">
              <TrendingUp className="w-4 h-4 text-dale-purple" />
              <span className="text-white font-medium">{activeOpportunities}</span>
              <span className="text-gray-400 text-sm">Activas</span>
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Desktop View */}
          <div className="hidden lg:grid grid-cols-6 gap-4">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col">
                <h3 className={`text-lg font-semibold text-white mb-4 flex items-center space-x-2`}>
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <span>{column.title}</span>
                  <span className="bg-dale-navy-lighter px-2 py-1 rounded-full text-sm text-gray-300">
                    {column.opportunities.length}
                  </span>
                </h3>
                
                <SortableContext
                  id={column.id}
                  items={column.opportunities.map(opp => opp.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[600px] p-4 rounded-lg bg-dale-navy space-y-4 overflow-y-auto max-h-[800px]">
                    {column.opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className={`card cursor-pointer p-4 mb-0 transition-all duration-200 hover:scale-105 ${
                          isUrgent(opportunity) ? 'border-red-500 border-2' : ''
                        }`}
                        onClick={() => handleCardClick(opportunity)}
                      >
                        <div className="space-y-3">
                          <div>
                            <div className="font-medium text-white text-sm line-clamp-2 mb-1">
                              {opportunity.proyecto}
                            </div>
                            <div className="text-xs text-gray-400">
                              {opportunity.cliente?.nombre || 'Cliente N/A'}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`flow-badge ${getFlowTypeColor(opportunity.tipo_flow)}`}>
                              {getFlowTypeLabel(opportunity.tipo_flow)}
                            </span>
                            {opportunity.budget && (
                              <span className="text-xs text-dale-emerald font-medium">
                                {formatCurrency(opportunity.budget)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {column.opportunities.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <div className="w-12 h-12 bg-dale-navy-lighter rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <Target className="w-6 h-6" />
                        </div>
                        <p className="text-sm">Sin oportunidades</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet View - Horizontal Scroll */}
          <div className="lg:hidden">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <div key={column.id} className="min-w-[300px] flex-shrink-0">
                  <h3 className={`text-lg font-semibold text-white mb-4 flex items-center space-x-2`}>
                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                    <span>{column.title}</span>
                    <span className="bg-dale-navy-lighter px-2 py-1 rounded-full text-sm text-gray-300">
                      {column.opportunities.length}
                    </span>
                  </h3>
                  
                  <div className="min-h-[500px] p-4 rounded-lg bg-dale-navy space-y-3 overflow-y-auto max-h-[700px]">
                    {column.opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className={`card cursor-pointer p-3 mb-0 transition-all duration-200 hover:scale-105 ${
                          isUrgent(opportunity) ? 'border-red-500 border-2' : ''
                        }`}
                        onClick={() => handleCardClick(opportunity)}
                      >
                        <div className="space-y-2">
                          <div>
                            <div className="font-medium text-white text-sm line-clamp-2 mb-1">
                              {opportunity.proyecto}
                            </div>
                            <div className="text-xs text-gray-400">
                              {opportunity.cliente?.nombre || 'Cliente N/A'}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`flow-badge ${getFlowTypeColor(opportunity.tipo_flow)}`}>
                              {getFlowTypeLabel(opportunity.tipo_flow)}
                            </span>
                            {opportunity.budget && (
                              <span className="text-xs text-dale-emerald font-medium">
                                {formatCurrency(opportunity.budget)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {column.opportunities.length === 0 && (
                      <div className="text-center py-6 text-gray-400">
                        <div className="w-10 h-10 bg-dale-navy-lighter rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <Target className="w-5 h-5" />
                        </div>
                        <p className="text-xs">Sin oportunidades</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="card p-4 w-80">
                <div className="font-medium text-white">Arrastrando...</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
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

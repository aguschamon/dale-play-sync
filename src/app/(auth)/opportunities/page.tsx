'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Target, DollarSign, Calendar, User } from 'lucide-react'
import { Oportunidad, Cliente } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Oportunidad[]>([])
  const [clients, setClients] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedFlow, setSelectedFlow] = useState('ALL')

  useEffect(() => {
    fetchData()
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

      const opportunitiesData = await opportunitiesRes.json()
      const clientsData = await clientsRes.json()

      setOpportunities(opportunitiesData)
      setClients(clientsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
      'INVOICED': 'Facturado',
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
    if (opportunity.tipo_flow === 'INBOUND') return true
    if (!opportunity.deadline) return false
    
    const now = new Date()
    const deadline = new Date(opportunity.deadline)
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours < 48
  }

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'ALL' || opportunity.estado === selectedStatus
    const matchesFlow = selectedFlow === 'ALL' || opportunity.tipo_flow === selectedFlow
    
    return matchesSearch && matchesStatus && matchesFlow
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dale-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando oportunidades...</p>
        </div>
      </div>
    )
  }

  const totalOpportunities = opportunities.length
  const totalBudget = opportunities.reduce((sum, opp) => sum + (opp.budget || 0), 0)
  const activeOpportunities = opportunities.filter(opp => 
    opp.estado !== 'PAID' && opp.estado !== 'REJECTED'
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Oportunidades</h1>
          <p className="text-gray-400 mt-2">
            Gestiona todas las oportunidades de sincronización musical
          </p>
        </div>
        <Link
          href="/opportunities/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Oportunidad</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-6 h-6 text-dale-blue" />
          </div>
          <div className="text-2xl font-bold text-white">{totalOpportunities}</div>
          <div className="text-sm text-gray-400">Total Oportunidades</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-6 h-6 text-dale-emerald" />
          </div>
          <div className="text-2xl font-bold text-dale-emerald">{formatCurrency(totalBudget)}</div>
          <div className="text-sm text-gray-400">Budget Total</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-dale-purple" />
          </div>
          <div className="text-2xl font-bold text-white">{activeOpportunities}</div>
          <div className="text-sm text-gray-400">Oportunidades Activas</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <User className="w-6 h-6 text-dale-amber" />
          </div>
          <div className="text-2xl font-bold text-white">{clients.length}</div>
          <div className="text-sm text-gray-400">Clientes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por proyecto o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="PITCHING">Pitching</option>
              <option value="NEGOTIATION">Negociación</option>
              <option value="APPROVAL">Aprobación</option>
              <option value="LEGAL">Legal</option>
              <option value="SIGNED">Firmado</option>
              <option value="INVOICED">Facturado</option>
              <option value="PAID">Pagado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
            
            <select
              value={selectedFlow}
              onChange={(e) => setSelectedFlow(e.target.value)}
              className="input-field"
            >
              <option value="ALL">Todos los Flows</option>
              <option value="INBOUND">INBOUND</option>
              <option value="OUTBOUND">OUTBOUND</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dale-navy-lighter">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Proyecto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Flow</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Budget</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Deadline</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpportunities.map((opportunity) => (
                <tr key={opportunity.id} className="border-b border-dale-navy-lighter hover:bg-dale-navy-lighter transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-dale-purple rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {opportunity.proyecto.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{opportunity.proyecto}</div>
                        <div className="text-sm text-gray-400">{opportunity.codigo}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-white">{opportunity.cliente?.nombre || 'N/A'}</div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={`status-badge ${getStatusColor(opportunity.estado)}`}>
                      {getStatusLabel(opportunity.estado)}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={`flow-badge ${getFlowTypeColor(opportunity.tipo_flow)}`}>
                      {getFlowTypeLabel(opportunity.tipo_flow)}
                    </span>
                    {isUrgent(opportunity) && (
                      <span className="ml-2 urgent-badge text-xs">URGENTE</span>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    {opportunity.budget ? (
                      <div className="text-dale-emerald font-medium">
                        {formatCurrency(opportunity.budget)}
                      </div>
                    ) : (
                      <div className="text-gray-400">Sin budget</div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    {opportunity.deadline ? (
                      <div className="text-white">{formatDate(opportunity.deadline)}</div>
                    ) : (
                      <div className="text-gray-400">Sin deadline</div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    <Link
                      href={`/opportunities/${opportunity.id}`}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dale-navy-lighter rounded-full mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No se encontraron oportunidades</h3>
            <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}

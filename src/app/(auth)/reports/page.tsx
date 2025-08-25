'use client'
import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, Target, Calendar, Users, PieChart, CheckCircle, Clock } from 'lucide-react'
import { Oportunidad, Cliente } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReportData {
  totalOpportunities: number
  totalBudget: number
  totalRevenue: number
  conversionRate: number
  avgDealTime: number
  inboundCount: number
  outboundCount: number
  statusDistribution: Record<string, number>
  clientPerformance: Array<{ clientId: string; clientName: string; opportunities: number; budget: number; revenue: number; roi: number }>
  monthlyTrends: Array<{ month: string; opportunities: number; revenue: number }>
  historicalSyncs: Array<{
    id: string
    proyecto: string
    cliente: string
    budget: number
    cancion: string
    fechaPagado: Date
    mesesAtras: number
  }>
  totalHistoricalRevenue: number
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('YTD')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
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
      const clients: Cliente[] = await clientsRes.json()

      // Calcular métricas básicas
      const totalOpportunities = opportunities.length
      const totalBudget = opportunities.reduce((sum, opp) => sum + (opp.budget || 0), 0)
      
      // Revenue (oportunidades pagadas)
      const totalRevenue = opportunities
        .filter(opp => opp.estado === 'PAID')
        .reduce((sum, opp) => sum + (opp.budget || 0), 0)

      // Tasa de conversión
      const conversionRate = totalOpportunities > 0 
        ? (opportunities.filter(opp => opp.estado === 'PAID').length / totalOpportunities) * 100 
        : 0

      // Tiempo promedio de deal
      const paidOpportunities = opportunities.filter(opp => opp.estado === 'PAID')
      const avgDealTime = paidOpportunities.length > 0 
        ? paidOpportunities.reduce((sum, opp) => {
            const created = new Date(opp.createdAt)
            const paid = new Date(opp.updatedAt)
            return sum + (paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
          }, 0) / paidOpportunities.length
        : 0

      // Contadores por tipo de flow
      const inboundCount = opportunities.filter(opp => opp.tipo_flow === 'INBOUND').length
      const outboundCount = opportunities.filter(opp => opp.tipo_flow === 'OUTBOUND').length

      // Distribución por estado
      const statusDistribution: Record<string, number> = {}
      opportunities.forEach(opp => {
        statusDistribution[opp.estado] = (statusDistribution[opp.estado] || 0) + 1
      })

      // Oportunidades activas (no pagadas ni rechazadas)
      const activeOpportunities = opportunities.filter(opp => 
        opp.estado !== 'PAID' && opp.estado !== 'REJECTED'
      ).length

      // Oportunidades urgentes (INBOUND o con deadline vencido)
      const urgentOpportunities = opportunities.filter(opp => {
        if (opp.tipo_flow === 'INBOUND') return true
        if (!opp.deadline) return false
        
        const now = new Date()
        const deadline = new Date(opp.deadline)
        const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
        return diffHours < 48
      }).length

      // Oportunidades con deadline próximo (3 días)
      const upcomingDeadlines = opportunities.filter(opp => {
        if (!opp.deadline) return false
        
        const now = new Date()
        const deadline = new Date(opp.deadline)
        const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays > 0 && diffDays <= 3
      }).length

      // Oportunidades vencidas
      const overdueOpportunities = opportunities.filter(opp => {
        if (!opp.deadline) return false
        
        const now = new Date()
        const deadline = new Date(opp.deadline)
        return deadline < now
      }).length

      // Performance por cliente
      const clientPerformance = clients.map(client => {
        const clientOpportunities = opportunities.filter(opp => opp.clienteId === client.id)
        const clientBudget = clientOpportunities.reduce((sum, opp) => sum + (opp.budget || 0), 0)
        const clientRevenue = clientOpportunities
          .filter(opp => opp.estado === 'PAID')
          .reduce((sum, opp) => sum + (opp.budget || 0), 0)
        
        return {
          clientId: client.id,
          clientName: client.nombre,
          opportunities: clientOpportunities.length,
          budget: clientBudget,
          revenue: clientRevenue,
          roi: clientBudget > 0 ? (clientRevenue / clientBudget) * 100 : 0
        }
      }).sort((a, b) => b.revenue - a.revenue)

      // Tendencias mensuales (últimos 12 meses)
      const monthlyTrends = []
      const now = new Date()
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
        
        const monthOpportunities = opportunities.filter(opp => {
          const oppDate = new Date(opp.createdAt)
          return oppDate.getMonth() === date.getMonth() && oppDate.getFullYear() === date.getFullYear()
        })
        
        const monthRevenue = monthOpportunities
          .filter(opp => opp.estado === 'PAID')
          .reduce((sum, opp) => sum + (opp.budget || 0), 0)
        
        monthlyTrends.push({
          month: monthName,
          opportunities: monthOpportunities.length,
          revenue: monthRevenue,
          budget: monthOpportunities.reduce((sum, opp) => sum + (opp.budget || 0), 0)
        })
      }

      // Estadísticas del catálogo (simuladas para el frontend)
      const obrasCount = 15
      const fonogramasCount = 8

      // NPS total del sistema (simulado para el frontend)
      const totalNPS = opportunities.reduce((sum, opp) => {
        const oppNPS = (opp.canciones || []).reduce((songSum, song) => {
          return songSum + (song.nps_total || 0)
        }, 0)
        return sum + oppNPS
      }, 0)

      // Sincronizaciones históricas (oportunidades pagadas)
      const historicalSyncs = opportunities
        .filter(opp => opp.estado === 'PAID')
        .map(opp => {
          const fechaPagado = new Date(opp.updatedAt)
          const mesesAtras = Math.floor((now.getTime() - fechaPagado.getTime()) / (1000 * 60 * 60 * 24 * 30))
          
          return {
            id: opp.id,
            proyecto: opp.proyecto,
            cliente: opp.cliente?.nombre || 'N/A',
            budget: opp.budget || 0,
            cancion: opp.canciones?.[0]?.obra?.nombre || 'N/A',
            fechaPagado,
            mesesAtras
          }
        })
        .sort((a, b) => b.fechaPagado.getTime() - a.fechaPagado.getTime())

      const totalHistoricalRevenue = historicalSyncs.reduce((sum, sync) => sum + sync.budget, 0)

      setReportData({
        // KPIs principales
        totalOpportunities,
        totalBudget,
        totalRevenue,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgDealTime: Math.round(avgDealTime * 10) / 10,
        
        // Contadores por tipo
        inboundCount,
        outboundCount,
        
        // Distribuciones
        statusDistribution,
        clientPerformance,
        monthlyTrends,
        
        // Sincronizaciones históricas
        historicalSyncs,
        totalHistoricalRevenue
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
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
      'INVOICED': 'bg-indigo-500',
      'PAID': 'bg-emerald-500',
      'REJECTED': 'bg-red-500'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dale-green mx-auto mb-4"></div>
          <p className="text-gray-400">Generando reportes...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Error al cargar reportes</h2>
        <p className="text-gray-400">No se pudieron cargar los datos de reportes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reportes y Métricas</h1>
          <p className="text-gray-400 mt-2">
            Análisis completo del rendimiento del negocio
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-dale-gray border border-dale-gray-light rounded-lg px-3 py-2 text-white"
          >
            <option value="YTD">Año en Curso</option>
            <option value="QTD">Trimestre Actual</option>
            <option value="MTD">Mes Actual</option>
            <option value="ALL">Todo el Tiempo</option>
          </select>
          <button
            onClick={fetchReportData}
            className="btn-secondary"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{reportData.totalOpportunities}</div>
          <div className="text-sm text-gray-400">Total Oportunidades</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-dale-green">{formatCurrency(reportData.totalBudget)}</div>
          <div className="text-sm text-gray-400">Budget Total</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(reportData.totalRevenue)}</div>
          <div className="text-sm text-gray-400">Revenue Generado</div>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{reportData.conversionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Tasa de Conversión</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-dale-green" />
          </div>
          <div className="text-2xl font-bold text-dale-green">{formatCurrency(reportData.totalHistoricalRevenue)}</div>
          <div className="text-sm text-gray-400">Revenue Histórico</div>
        </div>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-lg font-bold text-white mb-1">Tiempo Promedio de Deal</div>
          <div className="text-2xl font-bold text-blue-400">{reportData.avgDealTime.toFixed(1)} días</div>
        </div>
        
        <div className="card text-center">
          <div className="text-lg font-bold text-white mb-1">INBOUND vs OUTBOUND</div>
          <div className="text-sm text-gray-400">
            <span className="text-red-400">{reportData.inboundCount}</span> / 
            <span className="text-blue-400"> {reportData.outboundCount}</span>
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-lg font-bold text-white mb-1">Revenue por Oportunidad</div>
          <div className="text-2xl font-bold text-dale-green">
            {reportData.totalOpportunities > 0 ? formatCurrency(reportData.totalRevenue / reportData.totalOpportunities) : '$0'}
          </div>
        </div>
      </div>

      {/* Sincronizaciones Completadas */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Sincronizaciones Completadas</h3>
            <p className="text-gray-400 mt-1">
              Historial de syncs pagados y revenue histórico
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-dale-green">
              {formatCurrency(reportData.totalHistoricalRevenue)}
            </div>
            <div className="text-sm text-gray-400">Revenue Histórico Total</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dale-gray-light">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Proyecto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Canción</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Budget</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Fecha Pago</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {reportData.historicalSyncs.map((sync) => (
                <tr key={sync.id} className="border-b border-dale-gray-light hover:bg-dale-gray-light transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div className="font-medium text-white">{sync.proyecto}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white">{sync.cliente}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-300">{sync.cancion}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-dale-green font-medium">{formatCurrency(sync.budget)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white">{formatDate(sync.fechaPagado)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {sync.mesesAtras === 0 ? 'Este mes' : 
                         sync.mesesAtras === 1 ? '1 mes' : 
                         `${sync.mesesAtras} meses`}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribución por Estado */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Distribución por Estado</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(reportData.statusDistribution).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(status)} mx-auto mb-2`}></div>
              <div className="text-lg font-bold text-white">{count}</div>
              <div className="text-sm text-gray-400">{getStatusLabel(status)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance por Cliente */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Performance por Cliente</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dale-gray-light">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Oportunidades</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Budget Total</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">ROI</th>
              </tr>
            </thead>
            <tbody>
              {reportData.clientPerformance.map((client, index) => (
                <tr key={index} className="border-b border-dale-gray-light">
                  <td className="py-3 px-4 font-medium text-white">{client.clientName}</td>
                  <td className="py-3 px-4 text-white">{client.opportunities}</td>
                  <td className="py-3 px-4 text-white">{formatCurrency(client.budget)}</td>
                  <td className="py-3 px-4 text-dale-green">{formatCurrency(client.revenue)}</td>
                  <td className="py-3 px-4 text-blue-400">
                    {client.budget > 0 ? ((client.revenue / client.budget) * 100).toFixed(1) : '0'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tendencias Mensuales */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Tendencias Mensuales</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {reportData.monthlyTrends.map((month, index) => (
            <div key={index} className="text-center p-3 bg-dale-gray-light rounded-lg">
              <div className="text-sm text-gray-400 mb-1">{month.month}</div>
              <div className="text-lg font-bold text-white mb-1">{month.opportunities}</div>
              <div className="text-sm text-dale-green">{formatCurrency(month.revenue)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="card bg-dale-green bg-opacity-10 border border-dale-green">
        <h3 className="text-lg font-semibold text-dale-green mb-4">Resumen Ejecutivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">🎯 Oportunidades</h4>
            <p>El sistema tiene {reportData.totalOpportunities} oportunidades activas con un budget total de {formatCurrency(reportData.totalBudget)}.</p>
            <p className="mt-2">La tasa de conversión actual es del {reportData.conversionRate.toFixed(1)}%.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">💰 Revenue</h4>
            <p>Se ha generado {formatCurrency(reportData.totalRevenue)} en revenue con un tiempo promedio de deal de {reportData.avgDealTime.toFixed(1)} días.</p>
            <p className="mt-2">El revenue histórico total es de {formatCurrency(reportData.totalHistoricalRevenue)}.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

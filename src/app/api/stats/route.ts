import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/stats - Obtener estadísticas del sistema
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'YTD'

    // Obtener oportunidades
    const opportunities = await prisma.oportunidad.findMany({
      include: {
        cliente: true,
        canciones: {
          include: {
            obra: true,
            fonograma: true
          }
        }
      }
    })

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
    const clients = await prisma.cliente.findMany()
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

    // Estadísticas del catálogo
    const [obrasCount, fonogramasCount] = await Promise.all([
      prisma.obra.count(),
      prisma.fonograma.count()
    ])

    // NPS total del sistema
    const totalNPS = opportunities.reduce((sum, opp) => {
      const oppNPS = opp.canciones.reduce((songSum, song) => {
        return songSum + (song.nps_total || 0)
      }, 0)
      return sum + oppNPS
    }, 0)

    const stats = {
      // KPIs principales
      totalOpportunities,
      totalBudget,
      totalRevenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgDealTime: Math.round(avgDealTime * 10) / 10,
      
      // Contadores por tipo
      inboundCount,
      outboundCount,
      activeOpportunities,
      urgentOpportunities,
      upcomingDeadlines,
      overdueOpportunities,
      
      // Distribuciones
      statusDistribution,
      clientPerformance,
      monthlyTrends,
      
      // Catálogo
      obrasCount,
      fonogramasCount,
      totalNPS,
      
      // Período
      period,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


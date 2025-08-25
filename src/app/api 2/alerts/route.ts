import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/alerts - Obtener alertas del sistema
export async function GET(request: NextRequest) {
  try {
    // Obtener oportunidades con relaciones
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

    const alerts: any[] = []

    opportunities.forEach((opportunity) => {
      // Alertas por tipo de flow INBOUND
      if (opportunity.tipo_flow === 'INBOUND') {
        alerts.push({
          id: `inbound-${opportunity.id}`,
          type: 'URGENT',
          title: 'Oportunidad INBOUND Requiere Atención Inmediata',
          description: `La oportunidad "${opportunity.proyecto}" es INBOUND y requiere aprobación urgente.`,
          opportunityId: opportunity.id,
          opportunity: opportunity,
          createdAt: opportunity.createdAt,
          priority: 1,
          category: 'INBOUND'
        })
      }

      // Alertas por deadline
      if (opportunity.deadline) {
        const deadline = new Date(opportunity.deadline)
        const now = new Date()
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
          alerts.push({
            id: `deadline-${opportunity.id}`,
            type: 'URGENT',
            title: 'Deadline Vencido',
            description: `La oportunidad "${opportunity.proyecto}" tiene un deadline vencido.`,
            opportunityId: opportunity.id,
            opportunity: opportunity,
            createdAt: opportunity.createdAt,
            priority: 1,
            category: 'DEADLINE',
            daysOverdue: Math.abs(diffDays)
          })
        } else if (diffDays <= 3) {
          alerts.push({
            id: `deadline-warning-${opportunity.id}`,
            type: 'WARNING',
            title: 'Deadline Próximo',
            description: `La oportunidad "${opportunity.proyecto}" vence en ${diffDays} días.`,
            opportunityId: opportunity.id,
            opportunity: opportunity,
            createdAt: opportunity.createdAt,
            priority: 2,
            category: 'DEADLINE',
            daysUntilDeadline: diffDays
          })
        }
      }

      // Alertas por estado
      if (opportunity.estado === 'APPROVAL') {
        alerts.push({
          id: `approval-${opportunity.id}`,
          type: 'WARNING',
          title: 'Aprobación Pendiente',
          description: `La oportunidad "${opportunity.proyecto}" está esperando aprobación legal.`,
          opportunityId: opportunity.id,
          opportunity: opportunity,
          createdAt: opportunity.createdAt,
          priority: 2,
          category: 'APPROVAL'
        })
      }

      if (opportunity.estado === 'INVOICED') {
        alerts.push({
          id: `invoiced-${opportunity.id}`,
          type: 'INFO',
          title: 'Facturación Pendiente',
          description: `La oportunidad "${opportunity.proyecto}" está facturada y esperando pago.`,
          opportunityId: opportunity.id,
          opportunity: opportunity,
          createdAt: opportunity.createdAt,
          priority: 3,
          category: 'INVOICING'
        })
      }

      // Alertas por oportunidades sin canciones
      if (opportunity.canciones.length === 0 && opportunity.estado !== 'PITCHING') {
        alerts.push({
          id: `no-songs-${opportunity.id}`,
          type: 'WARNING',
          title: 'Sin Canciones Asignadas',
          description: `La oportunidad "${opportunity.proyecto}" no tiene canciones asignadas.`,
          opportunityId: opportunity.id,
          opportunity: opportunity,
          createdAt: opportunity.createdAt,
          priority: 2,
          category: 'CATALOG'
        })
      }

      // Alertas por oportunidades con budget alto sin canciones
      if (opportunity.budget && opportunity.budget > 50000 && opportunity.canciones.length === 0) {
        alerts.push({
          id: `high-budget-no-songs-${opportunity.id}`,
          type: 'WARNING',
          title: 'Budget Alto Sin Canciones',
          description: `La oportunidad "${opportunity.proyecto}" tiene un budget alto (${opportunity.budget}) pero no tiene canciones asignadas.`,
          opportunityId: opportunity.id,
          opportunity: opportunity,
          createdAt: opportunity.createdAt,
          priority: 2,
          category: 'BUDGET'
        })
      }
    })

    // Ordenar por prioridad y fecha
    alerts.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Agrupar por categoría
    const alertsByCategory = alerts.reduce((acc, alert) => {
      if (!acc[alert.category]) {
        acc[alert.category] = []
      }
      acc[alert.category].push(alert)
      return acc
    }, {} as Record<string, any[]>)

    // Resumen de alertas
    const summary = {
      total: alerts.length,
      urgent: alerts.filter(a => a.type === 'URGENT').length,
      warning: alerts.filter(a => a.type === 'WARNING').length,
      info: alerts.filter(a => a.type === 'INFO').length,
      byCategory: Object.keys(alertsByCategory).reduce((acc, category) => {
        acc[category] = alertsByCategory[category].length
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      alerts,
      alertsByCategory,
      summary,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

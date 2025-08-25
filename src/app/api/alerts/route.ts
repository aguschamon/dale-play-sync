import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Tipos para las alertas
interface Alert {
  id: string
  type: 'URGENT' | 'WARNING' | 'INFO'
  title: string
  description: string
  opportunityId: string
  opportunity: any
  createdAt: Date
  priority: number
  category: string
  daysOverdue?: number
  daysUntilDeadline?: number
}

interface AlertSummary {
  total: number
  urgent: number
  warning: number
  info: number
  byCategory: Record<string, number>
}

interface AlertsResponse {
  alerts: Alert[]
  alertsByCategory: Record<string, Alert[]>
  summary: AlertSummary
  lastUpdated: string
}

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
      },
      where: {
        // Solo mostrar oportunidades activas (no PAID ni REJECTED)
        estado: {
          notIn: ['PAID', 'REJECTED']
        }
      }
    })

    const alerts: Alert[] = []

    opportunities.forEach((opportunity) => {
      // Alertas por tipo de flow INBOUND (siempre prioritarias)
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
            description: `La oportunidad "${opportunity.proyecto}" tiene un deadline vencido hace ${Math.abs(diffDays)} días.`,
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
        } else if (diffDays <= 7) {
          alerts.push({
            id: `deadline-info-${opportunity.id}`,
            type: 'INFO',
            title: 'Deadline en 1 Semana',
            description: `La oportunidad "${opportunity.proyecto}" vence en ${diffDays} días.`,
            opportunityId: opportunity.id,
            opportunity: opportunity,
            createdAt: opportunity.createdAt,
            priority: 3,
            category: 'DEADLINE',
            daysUntilDeadline: diffDays
          })
        }
      }

      // Alertas por estado específico
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

      // Alertas por oportunidades sin canciones (excepto en PITCHING)
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
          description: `La oportunidad "${opportunity.proyecto}" tiene un budget alto ($${opportunity.budget.toLocaleString()}) pero no tiene canciones asignadas.`,
          opportunityId: opportunity.id,
          opportunity: opportunity,
          createdAt: opportunity.createdAt,
          priority: 2,
          category: 'BUDGET'
        })
      }

      // Alertas por oportunidades en LEGAL por mucho tiempo
      if (opportunity.estado === 'LEGAL') {
        const daysInLegal = Math.ceil((new Date().getTime() - new Date(opportunity.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
        if (daysInLegal > 7) {
          alerts.push({
            id: `legal-stuck-${opportunity.id}`,
            type: 'WARNING',
            title: 'Legal Atascado',
            description: `La oportunidad "${opportunity.proyecto}" está en Legal hace ${daysInLegal} días.`,
            opportunityId: opportunity.id,
            opportunity: opportunity,
            createdAt: opportunity.createdAt,
            priority: 2,
            category: 'LEGAL'
          })
        }
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
    }, {} as Record<string, Alert[]>)

    // Resumen de alertas
    const summary: AlertSummary = {
      total: alerts.length,
      urgent: alerts.filter(a => a.type === 'URGENT').length,
      warning: alerts.filter(a => a.type === 'WARNING').length,
      info: alerts.filter(a => a.type === 'INFO').length,
      byCategory: Object.keys(alertsByCategory).reduce((acc, category) => {
        acc[category] = alertsByCategory[category].length
        return acc
      }, {} as Record<string, number>)
    }

    const response: AlertsResponse = {
      alerts,
      alertsByCategory,
      summary,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    
    // En caso de error, retornar respuesta de error estructurada
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las alertas del sistema',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}


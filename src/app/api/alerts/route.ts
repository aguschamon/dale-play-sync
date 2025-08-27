import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Tipos para las alertas
interface Alert {
  id: string
  type: 'urgent' | 'warning' | 'info'
  title: string
  description: string
  date: Date
  priority: 'Alta' | 'Media' | 'Baja'
  metadata: {
    client?: string
    budget?: number
    deadline?: Date
    status?: string
    opportunityId?: string
    opportunity?: any
  }
}

interface AlertSummary {
  total: number
  urgent: number
  warning: number
  info: number
}

interface AlertsResponse {
  alerts: Alert[]
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

    // 1. ALERTAS URGENTES (3-4 alertas)
    opportunities.forEach((opportunity) => {
      // INBOUND siempre es urgente
      if (opportunity.tipo_flow === 'INBOUND') {
        alerts.push({
          id: `inbound-${opportunity.id}`,
          type: 'urgent',
          title: 'Oportunidad INBOUND Requiere Atención Inmediata',
          description: `La oportunidad "${opportunity.proyecto}" es INBOUND y requiere aprobación urgente.`,
          date: new Date(),
          priority: 'Alta',
          metadata: {
            client: opportunity.cliente?.nombre,
            budget: opportunity.budget || undefined,
            status: opportunity.estado,
            opportunityId: opportunity.id,
            opportunity: opportunity
          }
        })
      }

      // Deadlines vencidos o < 48h
      if (opportunity.deadline) {
        const deadline = new Date(opportunity.deadline)
        const now = new Date()
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
          alerts.push({
            id: `deadline-overdue-${opportunity.id}`,
            type: 'urgent',
            title: 'Deadline Vencido',
            description: `La oportunidad "${opportunity.proyecto}" tiene un deadline vencido hace ${Math.abs(diffDays)} días.`,
            date: new Date(),
            priority: 'Alta',
            metadata: {
              client: opportunity.cliente?.nombre,
              budget: opportunity.budget || undefined,
              deadline: deadline,
              status: opportunity.estado,
              opportunityId: opportunity.id,
              opportunity: opportunity
            }
          })
        } else if (diffDays <= 2) {
          alerts.push({
            id: `deadline-critical-${opportunity.id}`,
            type: 'urgent',
            title: 'Deadline Crítico',
            description: `La oportunidad "${opportunity.proyecto}" vence en ${diffDays} días.`,
            date: new Date(),
            priority: 'Alta',
            metadata: {
              client: opportunity.cliente?.nombre,
              budget: opportunity.budget || undefined,
              deadline: deadline,
              status: opportunity.estado,
              opportunityId: opportunity.id,
              opportunity: opportunity
            }
          })
        }
      }
    })

    // 2. ALERTAS DE ADVERTENCIA (2-3 alertas)
    opportunities.forEach((opportunity) => {
      // Deadlines próximos (7-14 días)
      if (opportunity.deadline) {
        const deadline = new Date(opportunity.deadline)
        const now = new Date()
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays > 2 && diffDays <= 14) {
          alerts.push({
            id: `deadline-warning-${opportunity.id}`,
            type: 'warning',
            title: 'Deadline Próximo',
            description: `La oportunidad "${opportunity.proyecto}" vence en ${diffDays} días.`,
            date: new Date(),
            priority: 'Media',
            metadata: {
              client: opportunity.cliente?.nombre,
              budget: opportunity.budget || undefined,
              deadline: deadline,
              status: opportunity.estado,
              opportunityId: opportunity.id,
              opportunity: opportunity
            }
          })
        }
      }

      // Aprobaciones pendientes
      if (opportunity.estado === 'APPROVAL') {
        alerts.push({
          id: `approval-${opportunity.id}`,
          type: 'warning',
          title: 'Aprobación Legal Pendiente',
          description: `La oportunidad "${opportunity.proyecto}" está esperando aprobación legal.`,
          date: new Date(),
          priority: 'Media',
          metadata: {
            client: opportunity.cliente?.nombre,
            budget: opportunity.budget || undefined,
            status: opportunity.estado,
            opportunityId: opportunity.id,
            opportunity: opportunity
          }
        })
      }

      // Sin canciones asignadas
      if (opportunity.canciones.length === 0 && opportunity.estado !== 'PITCHING') {
        alerts.push({
          id: `no-songs-${opportunity.id}`,
          type: 'warning',
          title: 'Sin Canciones Asignadas',
          description: `La oportunidad "${opportunity.proyecto}" no tiene canciones asignadas.`,
          date: new Date(),
          priority: 'Media',
          metadata: {
            client: opportunity.cliente?.nombre,
            budget: opportunity.budget || undefined,
            status: opportunity.estado,
            opportunityId: opportunity.id,
            opportunity: opportunity
          }
        })
      }
    })

    // 3. ALERTAS INFORMATIVAS (2-3 alertas)
    // Nuevas oportunidades creadas recientemente
    const recentOpportunities = opportunities
      .filter(opp => {
        const daysSinceCreation = Math.ceil((new Date().getTime() - new Date(opp.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        return daysSinceCreation <= 3
      })
      .slice(0, 2)

    recentOpportunities.forEach((opportunity) => {
      alerts.push({
        id: `new-opportunity-${opportunity.id}`,
        type: 'info',
        title: 'Nueva Oportunidad Creada',
        description: `Se ha creado la oportunidad "${opportunity.proyecto}" con ${opportunity.cliente?.nombre}.`,
        date: new Date(opportunity.createdAt),
        priority: 'Baja',
        metadata: {
          client: opportunity.cliente?.nombre,
          budget: opportunity.budget || undefined,
          status: opportunity.estado,
          opportunityId: opportunity.id,
          opportunity: opportunity
        }
      })
    })

    // Oportunidades facturadas
    const invoicedOpportunities = opportunities.filter(opp => opp.estado === 'INVOICED').slice(0, 1)
    invoicedOpportunities.forEach((opportunity) => {
      alerts.push({
        id: `invoiced-${opportunity.id}`,
        type: 'info',
        title: 'Oportunidad Facturada',
        description: `La oportunidad "${opportunity.proyecto}" ha sido facturada y está esperando pago.`,
        date: new Date(),
        priority: 'Baja',
        metadata: {
          client: opportunity.cliente?.nombre,
          budget: opportunity.budget || undefined,
          status: opportunity.estado,
          opportunityId: opportunity.id,
          opportunity: opportunity
        }
      })
    })

    // Ordenar por prioridad y fecha
    alerts.sort((a, b) => {
      const priorityOrder = { 'Alta': 1, 'Media': 2, 'Baja': 3 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    // Resumen de alertas
    const summary: AlertSummary = {
      total: alerts.length,
      urgent: alerts.filter(a => a.type === 'urgent').length,
      warning: alerts.filter(a => a.type === 'warning').length,
      info: alerts.filter(a => a.type === 'info').length
    }

    const response: AlertsResponse = {
      alerts,
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


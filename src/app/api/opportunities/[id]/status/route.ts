import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/opportunities/[id]/status - Cambiar estado de oportunidad
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Nuevo estado es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la oportunidad existe
    const existingOpportunity = await prisma.oportunidad.findUnique({
      where: { id: params.id }
    })

    if (!existingOpportunity) {
      return NextResponse.json(
        { error: 'Oportunidad no encontrada' },
        { status: 404 }
      )
    }

    // Validar transición de estado
    const validTransitions: Record<string, string[]> = {
      'PITCHING': ['NEGOTIATION', 'REJECTED'],
      'NEGOTIATION': ['APPROVAL', 'LEGAL', 'REJECTED'],
      'APPROVAL': ['LEGAL', 'REJECTED'],
      'LEGAL': ['SIGNED', 'REJECTED'],
      'SIGNED': ['INVOICED'],
      'INVOICED': ['PAID'],
      'PAID': [],
      'REJECTED': ['PITCHING']
    }

    const currentStatus = existingOpportunity.estado
    const allowedTransitions = validTransitions[currentStatus] || []

    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { 
          error: `Transición de estado no válida. De ${currentStatus} solo se puede cambiar a: ${allowedTransitions.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Actualizar el estado
    const updatedOpportunity = await prisma.oportunidad.update({
      where: { id: params.id },
      data: {
        estado: status,
        updatedAt: new Date()
      },
      include: {
        cliente: true
      }
    })

    // Crear actividad de cambio de estado
    await prisma.actividad.create({
      data: {
        oportunidadId: updatedOpportunity.id,
        usuarioId: 'system', // Usuario del sistema
        tipo_actividad: 'STATUS_CHANGED',
        descripcion: `Estado cambiado de ${currentStatus} a ${status}`,
        metadata: JSON.stringify({
          estado_anterior: currentStatus,
          estado_nuevo: status,
          fecha_cambio: new Date().toISOString()
        })
      }
    })

    // Si el estado es PAID, crear actividad especial
    if (status === 'PAID') {
      await prisma.actividad.create({
        data: {
          oportunidadId: updatedOpportunity.id,
          usuarioId: 'system',
          tipo_actividad: 'OPPORTUNITY_COMPLETED',
          descripcion: `Oportunidad ${updatedOpportunity.codigo} completada exitosamente`,
          metadata: JSON.stringify({
            fecha_completado: new Date().toISOString(),
            budget: updatedOpportunity.budget
          })
        }
      })
    }

    // Si el estado es REJECTED, crear actividad especial
    if (status === 'REJECTED') {
      await prisma.actividad.create({
        data: {
          oportunidadId: updatedOpportunity.id,
          usuarioId: 'system',
          tipo_actividad: 'OPPORTUNITY_REJECTED',
          descripcion: `Oportunidad ${updatedOpportunity.codigo} rechazada`,
          metadata: JSON.stringify({
            fecha_rechazo: new Date().toISOString(),
            motivo: 'Cambio de estado manual'
          })
        }
      })
    }

    return NextResponse.json(updatedOpportunity)
  } catch (error) {
    console.error('Error updating opportunity status:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


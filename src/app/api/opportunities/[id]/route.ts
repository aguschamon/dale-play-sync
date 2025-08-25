import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/opportunities/[id] - Obtener oportunidad específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = await prisma.oportunidad.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        syncManager: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        legal: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        admin: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Oportunidad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('Error fetching opportunity:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/opportunities/[id] - Actualizar oportunidad
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validaciones básicas
    if (!body.proyecto || body.proyecto.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nombre del proyecto es requerido' },
        { status: 400 }
      )
    }

    if (body.budget && body.budget < 0) {
      return NextResponse.json(
        { error: 'Budget no puede ser negativo' },
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

    // Actualizar la oportunidad
    const updatedOpportunity = await prisma.oportunidad.update({
      where: { id: params.id },
      data: {
        proyecto: body.proyecto.trim(),
        tipo_proyecto: body.tipo_proyecto || existingOpportunity.tipo_proyecto,
        territorio: body.territorio || existingOpportunity.territorio,
        duracion_licencia: body.duracion_licencia || existingOpportunity.duracion_licencia,
        tipo_uso: body.tipo_uso || existingOpportunity.tipo_uso,
        budget: body.budget ? parseFloat(body.budget) : existingOpportunity.budget,
        mfn: body.mfn !== undefined ? body.mfn : existingOpportunity.mfn,
        deadline: body.deadline ? new Date(body.deadline) : existingOpportunity.deadline,
        metadata: body.metadata || existingOpportunity.metadata,
        syncManagerId: body.syncManagerId || existingOpportunity.syncManagerId,
        legalId: body.legalId || existingOpportunity.legalId,
        adminId: body.adminId || existingOpportunity.adminId
      },
      include: {
        cliente: true
      }
    })

    // Crear actividad de actualización
    await prisma.actividad.create({
      data: {
        oportunidadId: updatedOpportunity.id,
        usuarioId: 'system', // Usuario del sistema
        tipo_actividad: 'OPPORTUNITY_UPDATED',
        descripcion: `Oportunidad ${updatedOpportunity.codigo} actualizada`,
        metadata: JSON.stringify({
          cambios: Object.keys(body).filter(key => key !== 'id')
        })
      }
    })

    return NextResponse.json(updatedOpportunity)
  } catch (error) {
    console.error('Error updating opportunity:', error)
    
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

// DELETE /api/opportunities/[id] - Eliminar oportunidad
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que la oportunidad existe
    const existingOpportunity = await prisma.oportunidad.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            oportunidadCanciones: true,
            actividades: true,
            documentos: true
          }
        }
      }
    })

    if (!existingOpportunity) {
      return NextResponse.json(
        { error: 'Oportunidad no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene registros relacionados
    if (existingOpportunity._count.oportunidadCanciones > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una oportunidad que tiene canciones asociadas' },
        { status: 400 }
      )
    }

    // Eliminar registros relacionados primero
    await prisma.actividad.deleteMany({
      where: { oportunidadId: params.id }
    })

    await prisma.documento.deleteMany({
      where: { oportunidadId: params.id }
    })

    // Eliminar la oportunidad
    await prisma.oportunidad.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Oportunidad eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting opportunity:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


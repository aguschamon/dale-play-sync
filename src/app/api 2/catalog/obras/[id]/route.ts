import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/catalog/obras/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const obra = await prisma.obra.findUnique({
      where: { id: params.id }
    })

    if (!obra) {
      return NextResponse.json(
        { error: 'Obra no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(obra)
  } catch (error) {
    console.error('Error fetching obra:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/catalog/obras/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.nombre || !body.porcentaje_control_dp || !body.porcentaje_share_dp) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar porcentajes
    if (body.porcentaje_control_dp < 0 || body.porcentaje_control_dp > 100) {
      return NextResponse.json(
        { error: 'Porcentaje de control debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    if (body.porcentaje_share_dp < 0 || body.porcentaje_share_dp > 100) {
      return NextResponse.json(
        { error: 'Porcentaje de share debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    // Actualizar la obra
    const obra = await prisma.obra.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        iswc: body.iswc || null,
        porcentaje_control_dp: parseFloat(body.porcentaje_control_dp),
        porcentaje_share_dp: parseFloat(body.porcentaje_share_dp),
        compositores: body.compositores || null,
        territorio: body.territorio || 'Mundial',
        metadata: body.metadata || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(obra)
  } catch (error) {
    console.error('Error updating obra:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Obra no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/catalog/obras/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si la obra existe
    const obra = await prisma.obra.findUnique({
      where: { id: params.id }
    })

    if (!obra) {
      return NextResponse.json(
        { error: 'Obra no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si hay fonogramas asociados
    const fonogramas = await prisma.fonograma.findMany({
      where: { obraId: params.id }
    })

    if (fonogramas.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la obra porque tiene fonogramas asociados' },
        { status: 400 }
      )
    }

    // Eliminar la obra
    await prisma.obra.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Obra eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting obra:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

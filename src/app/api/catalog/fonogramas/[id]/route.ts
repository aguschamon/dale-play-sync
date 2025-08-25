import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/catalog/fonogramas/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fonograma = await prisma.fonograma.findUnique({
      where: { id: params.id },
      include: {
        obra: true
      }
    })

    if (!fonograma) {
      return NextResponse.json(
        { error: 'Fonograma no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(fonograma)
  } catch (error) {
    console.error('Error fetching fonograma:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/catalog/fonogramas/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.obraId || !body.nombre || !body.artista_principal || !body.porcentaje_dp) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar porcentaje
    if (body.porcentaje_dp < 0 || body.porcentaje_dp > 100) {
      return NextResponse.json(
        { error: 'Porcentaje debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    // Verificar que la obra existe
    const obra = await prisma.obra.findUnique({
      where: { id: body.obraId }
    })

    if (!obra) {
      return NextResponse.json(
        { error: 'La obra especificada no existe' },
        { status: 400 }
      )
    }

    // Actualizar el fonograma
    const fonograma = await prisma.fonograma.update({
      where: { id: params.id },
      data: {
        obraId: body.obraId,
        nombre: body.nombre,
        isrc: body.isrc || null,
        porcentaje_dp: parseFloat(body.porcentaje_dp),
        artista_principal: body.artista_principal,
        featured_artists: body.featured_artists || null,
        sello: body.sello || 'Dale Play Records',
        anio_lanzamiento: body.anio_lanzamiento || new Date().getFullYear(),
        metadata: body.metadata || null,
        updatedAt: new Date()
      },
      include: {
        obra: true
      }
    })

    return NextResponse.json(fonograma)
  } catch (error) {
    console.error('Error updating fonograma:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Fonograma no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/catalog/fonogramas/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el fonograma existe
    const fonograma = await prisma.fonograma.findUnique({
      where: { id: params.id }
    })

    if (!fonograma) {
      return NextResponse.json(
        { error: 'Fonograma no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si hay oportunidades asociadas
    const oportunidades = await prisma.oportunidadCancion.findMany({
      where: { fonogramaId: params.id }
    })

    if (oportunidades.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el fonograma porque está asociado a oportunidades' },
        { status: 400 }
      )
    }

    // Eliminar el fonograma
    await prisma.fonograma.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Fonograma eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting fonograma:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


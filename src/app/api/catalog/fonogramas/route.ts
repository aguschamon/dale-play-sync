import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/catalog/fonogramas
export async function GET() {
  try {
    const fonogramas = await prisma.fonograma.findMany({
      include: {
        obra: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(fonogramas)
  } catch (error) {
    console.error('Error fetching fonogramas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/catalog/fonogramas
export async function POST(request: NextRequest) {
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

    // Crear el fonograma
    const fonograma = await prisma.fonograma.create({
      data: {
        obraId: body.obraId,
        nombre: body.nombre,
        isrc: body.isrc || null,
        porcentaje_dp: parseFloat(body.porcentaje_dp),
        artista_principal: body.artista_principal,
        featured_artists: body.featured_artists || null,
        sello: body.sello || 'Dale Play Records',
        anio_lanzamiento: body.anio_lanzamiento || new Date().getFullYear(),
        metadata: body.metadata || null
      },
      include: {
        obra: true
      }
    })

    return NextResponse.json(fonograma, { status: 201 })
  } catch (error) {
    console.error('Error creating fonograma:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


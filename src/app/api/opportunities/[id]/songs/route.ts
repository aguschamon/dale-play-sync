import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/opportunities/[id]/songs - Agregar canción a oportunidad
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id
    const body = await request.json()
    const { obraId, fonogramaId, budget_cancion } = body

    // Validar datos requeridos
    if (!obraId) {
      return NextResponse.json(
        { error: 'ID de obra es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la oportunidad existe
    const opportunity = await prisma.oportunidad.findUnique({
      where: { id: opportunityId }
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Oportunidad no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la obra existe
    const obra = await prisma.obra.findUnique({
      where: { id: obraId }
    })

    if (!obra) {
      return NextResponse.json(
        { error: 'Obra no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el fonograma existe si se proporciona
    let fonograma = null
    if (fonogramaId) {
      fonograma = await prisma.fonograma.findUnique({
        where: { id: fonogramaId }
      })

      if (!fonograma) {
        return NextResponse.json(
          { error: 'Fonograma no encontrado' },
          { status: 404 }
        )
      }

      // Verificar que el fonograma pertenece a la obra
      if (fonograma.obraId !== obraId) {
        return NextResponse.json(
          { error: 'El fonograma no pertenece a la obra especificada' },
          { status: 400 }
        )
      }
    }

    // Verificar que no se haya agregado la misma canción
    const existingSong = await prisma.oportunidadCancion.findFirst({
      where: {
        oportunidadId: opportunityId,
        obraId: obraId,
        fonogramaId: fonogramaId || null
      }
    })

    if (existingSong) {
      return NextResponse.json(
        { error: 'Esta canción ya está agregada a la oportunidad' },
        { status: 400 }
      )
    }

    // Calcular NPS
    const budget = budget_cancion || opportunity.budget || 0
    const publishingNPS = (budget * 0.5) * (obra.porcentaje_share_dp / 100)
    let recordingNPS = 0

    if (fonograma) {
      recordingNPS = (budget * 0.5) * (fonograma.porcentaje_dp / 100)
    }

    const npsTotal = publishingNPS + recordingNPS

    // Crear la canción en la oportunidad
    const oportunidadCancion = await prisma.oportunidadCancion.create({
      data: {
        oportunidadId: opportunityId,
        obraId: obraId,
        fonogramaId: fonogramaId,
        budget_cancion: budget_cancion,
        nps_publishing: publishingNPS,
        nps_recording: recordingNPS,
        nps_total: npsTotal
      },
      include: {
        obra: true,
        fonograma: true
      }
    })

    // Crear actividad
    await prisma.actividad.create({
      data: {
        oportunidadId: opportunityId,
        usuarioId: opportunity.sync_manager_id,
        tipo_actividad: 'CANCIÓN_AGREGADA',
        descripcion: `Se agregó "${obra.nombre}" a la oportunidad`,
        metadata: JSON.stringify({
          obraId: obraId,
          fonogramaId: fonogramaId,
          budget_cancion: budget_cancion,
          nps_total: npsTotal
        })
      }
    })

    return NextResponse.json(oportunidadCancion, { status: 201 })
  } catch (error) {
    console.error('Error adding song to opportunity:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET /api/opportunities/[id]/songs - Obtener canciones de una oportunidad
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id

    // Verificar que la oportunidad existe
    const opportunity = await prisma.oportunidad.findUnique({
      where: { id: opportunityId }
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Oportunidad no encontrada' },
        { status: 404 }
      )
    }

    // Obtener canciones con relaciones
    const songs = await prisma.oportunidadCancion.findMany({
      where: { oportunidadId: opportunityId },
      include: {
        obra: true,
        fonograma: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching opportunity songs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

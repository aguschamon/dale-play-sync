import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE /api/opportunities/[id]/songs/[songId] - Eliminar canción de oportunidad
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; songId: string } }
) {
  try {
    const opportunityId = params.id
    const songId = params.songId

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

    // Verificar que la canción existe y pertenece a la oportunidad
    const song = await prisma.oportunidadCancion.findFirst({
      where: {
        id: songId,
        oportunidadId: opportunityId
      },
      include: {
        obra: true
      }
    })

    if (!song) {
      return NextResponse.json(
        { error: 'Canción no encontrada en esta oportunidad' },
        { status: 404 }
      )
    }

    // Eliminar la canción
    await prisma.oportunidadCancion.delete({
      where: { id: songId }
    })

    // Crear actividad
    await prisma.actividad.create({
      data: {
        oportunidadId: opportunityId,
        usuarioId: opportunity.sync_manager_id,
        tipo_actividad: 'CANCIÓN_ELIMINADA',
        descripcion: `Se eliminó "${song.obra.nombre}" de la oportunidad`,
        metadata: JSON.stringify({
          obraId: song.obraId,
          fonogramaId: song.fonogramaId,
          budget_cancion: song.budget_cancion,
          nps_total: song.nps_total
        })
      }
    })

    return NextResponse.json({ message: 'Canción eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting song from opportunity:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

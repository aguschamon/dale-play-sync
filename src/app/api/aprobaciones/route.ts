import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/aprobaciones - Listar todas las aprobaciones con datos relacionados
export async function GET() {
  try {
    const aprobaciones = await prisma.aprobacion.findMany({
      include: {
        oportunidad: {
          include: {
            cliente: true
          }
        },
        titular: true
      },
      orderBy: {
        fecha_envio: 'desc'
      }
    })

    return NextResponse.json(aprobaciones)
  } catch (error) {
    console.error('Error fetching aprobaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener aprobaciones' },
      { status: 500 }
    )
  }
}

// POST /api/aprobaciones - Crear nuevas aprobaciones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { oportunidadId, titulares } = body

    if (!oportunidadId || !titulares || !Array.isArray(titulares)) {
      return NextResponse.json(
        { error: 'oportunidadId y titulares son campos obligatorios' },
        { status: 400 }
      )
    }

    // Crear aprobaciones para cada titular
    const aprobacionesData = titulares.map((titularId: string) => ({
      oportunidad_id: oportunidadId,
      titular_id: titularId,
      estado: 'PENDIENTE',
      token: crypto.randomUUID(), // Generar token único
      fecha_envio: new Date()
    }))

    const aprobaciones = await prisma.aprobacion.createMany({
      data: aprobacionesData
    })

    return NextResponse.json({
      message: `${aprobaciones.count} aprobaciones creadas exitosamente`,
      count: aprobaciones.count
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating aprobaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al crear aprobaciones' },
      { status: 500 }
    )
  }
}

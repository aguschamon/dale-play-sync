import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/catalog/obras
export async function GET() {
  try {
    const obras = await prisma.obra.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(obras)
  } catch (error) {
    console.error('Error fetching obras:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/catalog/obras
export async function POST(request: NextRequest) {
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

    // Crear la obra
    const obra = await prisma.obra.create({
      data: {
        nombre: body.nombre,
        iswc: body.iswc || null,
        porcentaje_control_dp: parseFloat(body.porcentaje_control_dp),
        porcentaje_share_dp: parseFloat(body.porcentaje_share_dp),
        compositores: body.compositores || null,
        territorio: body.territorio || 'Mundial',
        metadata: body.metadata || null
      }
    })

    return NextResponse.json(obra, { status: 201 })
  } catch (error) {
    console.error('Error creating obra:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


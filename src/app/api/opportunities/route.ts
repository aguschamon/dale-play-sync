import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/opportunities - Obtener todas las oportunidades
export async function GET() {
  try {
    const opportunities = await prisma.oportunidad.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/opportunities - Crear nueva oportunidad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validaciones básicas
    if (!body.clienteId) {
      return NextResponse.json(
        { error: 'Cliente es requerido' },
        { status: 400 }
      )
    }

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

    // Determinar estado inicial según el tipo de flow
    let estadoInicial = 'PITCHING'
    if (body.tipo_flow === 'INBOUND') {
      estadoInicial = 'APPROVAL'
    }

    // Crear la oportunidad
    const opportunity = await prisma.oportunidad.create({
      data: {
        codigo: body.codigo || generateOpportunityCode(),
        tipo_flow: body.tipo_flow || 'OUTBOUND',
        estado: estadoInicial,
        clienteId: body.clienteId,
        proyecto: body.proyecto.trim(),
        tipo_proyecto: body.tipo_proyecto || 'SERIE',
        territorio: body.territorio || 'Mundial',
        duracion_licencia: body.duracion_licencia || null,
        tipo_uso: body.tipo_uso || null,
        budget: body.budget ? parseFloat(body.budget) : null,
        mfn: body.mfn || false,
        deadline: body.deadline ? new Date(body.deadline) : null,
        metadata: body.metadata || null,
        // Asignar usuarios por defecto (pueden ser actualizados después)
        sync_manager_id: body.syncManagerId || 'system',
        legal_id: body.legalId || null,
        admin_id: body.adminId || null
      },
      include: {
        cliente: true
      }
    })

    // Crear actividad de creación
    await prisma.actividad.create({
      data: {
        oportunidadId: opportunity.id,
        usuarioId: 'system', // Usuario del sistema
        tipo_actividad: 'OPPORTUNITY_CREATED',
        descripcion: `Oportunidad ${opportunity.codigo} creada para ${opportunity.proyecto}`,
        metadata: JSON.stringify({
          estado_anterior: null,
          estado_nuevo: estadoInicial,
          tipo_flow: opportunity.tipo_flow
        })
      }
    })

    return NextResponse.json(opportunity, { status: 201 })
  } catch (error) {
    console.error('Error creating opportunity:', error)
    
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

// Función auxiliar para generar código de oportunidad
function generateOpportunityCode(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `OPP-${year}-${random}`
}


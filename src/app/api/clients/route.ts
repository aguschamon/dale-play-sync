import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/clients - Obtener todos los clientes
export async function GET() {
  try {
    const clients = await prisma.cliente.findMany({
      orderBy: {
        nombre: 'asc'
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/clients - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validaciones básicas
    if (!body.nombre || body.nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nombre del cliente es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un cliente con el mismo nombre
    const existingClient = await prisma.cliente.findFirst({
      where: {
        nombre: {
          equals: body.nombre.trim()
        }
      }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con ese nombre' },
        { status: 400 }
      )
    }

    // Crear el cliente
    const client = await prisma.cliente.create({
      data: {
        nombre: body.nombre.trim(),
        tipo: body.tipo || 'PLATAFORMA',
        contactos: body.contactos ? JSON.stringify(body.contactos) : null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    
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


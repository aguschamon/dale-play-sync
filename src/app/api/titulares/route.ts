import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/titulares - Listar todos los titulares con conteos
export async function GET() {
  try {
    console.log('🔍 Iniciando consulta de titulares...')
    
    // Primero probar una consulta simple
    const titulares = await prisma.titular.findMany()
    console.log(`✅ Encontrados ${titulares.length} titulares`)
    
    // Ahora agregar el conteo
    const titularesConConteo = await prisma.titular.findMany({
      include: {
        _count: {
          select: {
            obras: true,
            fonogramas: true,
            aprobaciones: {
              where: {
                estado: 'PENDIENTE'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('✅ Consulta con conteo completada')
    return NextResponse.json(titularesConConteo)
  } catch (error) {
    console.error('❌ Error fetching titulares:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener titulares', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/titulares - Crear nuevo titular
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, tipo, notas, obras, fonogramas } = body

    // Validar campos obligatorios
    if (!nombre || !email || !tipo) {
      return NextResponse.json(
        { error: 'Nombre, email y tipo son campos obligatorios' },
        { status: 400 }
      )
    }

    // Crear titular
    const titular = await prisma.titular.create({
      data: {
        nombre,
        email,
        telefono: telefono || null,
        tipo,
        notas: notas || null
      }
    })

    // Crear relaciones con obras si se proporcionan
    if (obras && obras.length > 0) {
      const obrasData = obras.map((obra: any) => ({
        titular_id: titular.id,
        obra_id: obra.obraId,
        porcentaje: obra.porcentaje,
        rol: obra.rol
      }))

      await prisma.titularObra.createMany({
        data: obrasData
      })
    }

    // Crear relaciones con fonogramas si se proporcionan
    if (fonogramas && fonogramas.length > 0) {
      const fonogramasData = fonogramas.map((fonograma: any) => ({
        titular_id: titular.id,
        fonograma_id: fonograma.fonogramaId,
        porcentaje: fonograma.porcentaje,
        rol: fonograma.rol
      }))

      await prisma.titularFonograma.createMany({
        data: fonogramasData
      })
    }

    return NextResponse.json(titular, { status: 201 })
  } catch (error) {
    console.error('Error creating titular:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al crear titular' },
      { status: 500 }
    )
  }
}

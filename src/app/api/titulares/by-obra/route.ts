import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const obraId = searchParams.get('obraId')
    
    if (!obraId) {
      return NextResponse.json(
        { error: 'obraId es requerido' },
        { status: 400 }
      )
    }
    
    const titularesObra = await prisma.titularObra.findMany({
      where: { obra_id: obraId },
      include: {
        titular: {
          select: {
            id: true,
            nombre: true,
            email: true,
            tipo: true
          }
        }
      }
    })
    
    const titulares = titularesObra.map(to => ({
      id: to.titular.id,
      nombre: to.titular.nombre,
      email: to.titular.email,
      tipo: to.titular.tipo,
      porcentaje: to.porcentaje
    }))
    
    return NextResponse.json({ titulares })
    
  } catch (error) {
    console.error('Error obteniendo titulares por obra:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

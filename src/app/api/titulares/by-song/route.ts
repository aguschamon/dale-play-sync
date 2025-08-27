import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const songId = searchParams.get('songId')
    const songType = searchParams.get('type') // 'obra' o 'fonograma'
    
    if (!songId || !songType) {
      return NextResponse.json(
        { error: 'songId y type son requeridos' },
        { status: 400 }
      )
    }
    
    let titulares: any[] = []
    
    if (songType === 'obra') {
      // Buscar titulares de la obra
      const titularesObra = await prisma.titularObra.findMany({
        where: { obra_id: songId },
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
      
      titulares = titularesObra.map(to => ({
        id: to.titular.id,
        nombre: to.titular.nombre,
        email: to.titular.email,
        tipo: to.titular.tipo,
        porcentaje: to.porcentaje,
        rol: to.rol,
        source: 'obra'
      }))
      
    } else if (songType === 'fonograma') {
      // Buscar titulares del fonograma
      const titularesFonograma = await prisma.titularFonograma.findMany({
        where: { fonograma_id: songId },
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
      
      titulares = titularesFonograma.map(tf => ({
        id: tf.titular.id,
        nombre: tf.titular.nombre,
        email: tf.titular.email,
        tipo: tf.titular.tipo,
        porcentaje: tf.porcentaje,
        rol: tf.rol,
        source: 'fonograma'
      }))
      
      // También buscar titulares de la obra asociada al fonograma
      const fonograma = await prisma.fonograma.findUnique({
        where: { id: songId },
        select: { obraId: true }
      })
      
      if (fonograma?.obraId) {
        const titularesObra = await prisma.titularObra.findMany({
          where: { obra_id: fonograma.obraId },
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
        
        const titularesObraData = titularesObra.map(to => ({
          id: to.titular.id,
          nombre: to.titular.nombre,
          email: to.titular.email,
          tipo: to.titular.tipo,
          porcentaje: to.porcentaje,
          rol: to.rol,
          source: 'obra'
        }))
        
        // Combinar titulares únicos (evitar duplicados)
        const allTitulares = [...titulares, ...titularesObraData]
        const uniqueTitulares = allTitulares.filter((titular, index, self) => 
          index === self.findIndex(t => t.id === titular.id)
        )
        
        titulares = uniqueTitulares
      }
    }
    
    return NextResponse.json({ 
      titulares,
      count: titulares.length,
      songType,
      songId
    })
    
  } catch (error) {
    console.error('Error obteniendo titulares por canción:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

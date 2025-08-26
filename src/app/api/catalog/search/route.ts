import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/catalog/search?q=query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }

    const searchTerm = query.trim().toLowerCase()

    // Buscar en obras
    const obras = await prisma.obra.findMany({
      where: {
        OR: [
          { nombre: { contains: searchTerm } },
          { iswc: { contains: searchTerm } },
          { compositores: { contains: searchTerm } }
        ]
      },
      include: {
        fonogramas: true
      },
      take: 10
    })

    // Buscar en fonogramas
    const fonogramas = await prisma.fonograma.findMany({
      where: {
        OR: [
          { nombre: { contains: searchTerm } },
          { isrc: { contains: searchTerm } },
          { artista_principal: { contains: searchTerm } },
          { featured_artists: { contains: searchTerm } }
        ]
      },
      include: {
        obra: true
      },
      take: 10
    })

    // Combinar y formatear resultados
    const results: any[] = []

    // Agregar obras con sus fonogramas
    for (const obra of obras) {
      results.push({
        type: 'obra',
        id: obra.id,
        nombre: obra.nombre,
        iswc: obra.iswc,
        compositores: obra.compositores,
        porcentaje_control_dp: obra.porcentaje_control_dp,
        porcentaje_share_dp: obra.porcentaje_share_dp,
        territorio: obra.territorio,
        fonogramas: obra.fonogramas.map((f: any) => ({
          id: f.id,
          nombre: f.nombre,
          isrc: f.isrc,
          porcentaje_dp: f.porcentaje_dp,
          artista_principal: f.artista_principal,
          featured_artists: f.featured_artists,
          sello: f.sello,
          anio_lanzamiento: f.anio_lanzamiento
        }))
      })
    }

    // Agregar fonogramas que no estén ya incluidos
    for (const fonograma of fonogramas) {
      const alreadyIncluded = results.some((r: any) => 
        r.type === 'obra' && r.fonogramas.some((f: any) => f.id === fonograma.id)
      )
      
      if (!alreadyIncluded) {
        results.push({
          type: 'fonograma',
          id: fonograma.id,
          nombre: fonograma.nombre,
          isrc: fonograma.isrc,
          porcentaje_dp: fonograma.porcentaje_dp,
          artista_principal: fonograma.artista_principal,
          featured_artists: fonograma.featured_artists,
          sello: fonograma.sello,
          anio_lanzamiento: fonograma.anio_lanzamiento,
          obra: {
            id: fonograma.obra.id,
            nombre: fonograma.obra.nombre,
            iswc: fonograma.obra.iswc,
            compositores: fonograma.obra.compositores,
            porcentaje_control_dp: fonograma.obra.porcentaje_control_dp,
            porcentaje_share_dp: fonograma.obra.porcentaje_share_dp,
            territorio: fonograma.obra.territorio
          }
        })
      }
    }

    // Ordenar por relevancia (obras primero, luego fonogramas)
    results.sort((a: any, b: any) => {
      if (a.type === 'obra' && b.type === 'fonograma') return -1
      if (a.type === 'fonograma' && b.type === 'obra') return 1
      return 0
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching catalog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

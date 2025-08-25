import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/catalog/search?q=query - Búsqueda fuzzy del catálogo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }

    const searchTerm = query.trim().toLowerCase()

    // Búsqueda en obras
    const obras = await prisma.obra.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: searchTerm
            }
          },
          {
            iswc: {
              contains: searchTerm
            }
          }
        ]
      },
      include: {
        fonogramas: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    })

    // Búsqueda en fonogramas
    const fonogramas = await prisma.fonograma.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: searchTerm
            }
          },
          {
            artista_principal: {
              contains: searchTerm
            }
          },
          {
            isrc: {
              contains: searchTerm
            }
          }
        ]
      },
      include: {
        obra: true
      }
    })

    // Combinar resultados y eliminar duplicados
    const results: any[] = []

    // Agregar obras encontradas directamente
    obras.forEach(obra => {
      results.push({
        obra,
        fonogramas: obra.fonogramas || []
      })
    })

    // Agregar obras encontradas a través de fonogramas
    fonogramas.forEach(fonograma => {
      if (!fonograma.obra) return
      
      const existingResult = results.find(r => r.obra.id === fonograma.obra.id)
      
      if (existingResult) {
        // Si la obra ya existe, agregar el fonograma si no está
        if (!existingResult.fonogramas.find((f: any) => f.id === fonograma.id)) {
          existingResult.fonogramas.push(fonograma)
        }
      } else {
        // Si la obra no existe, crear nuevo resultado
        results.push({
          obra: fonograma.obra,
          fonogramas: [fonograma]
        })
      }
    })

    // Ordenar por relevancia (obras que coinciden exactamente primero)
    results.sort((a, b) => {
      const aExactMatch = a.obra.nombre.toLowerCase().includes(searchTerm)
      const bExactMatch = b.obra.nombre.toLowerCase().includes(searchTerm)
      
      if (aExactMatch && !bExactMatch) return -1
      if (!aExactMatch && bExactMatch) return 1
      
      return a.obra.nombre.localeCompare(b.obra.nombre)
    })

    // Limitar resultados a 20 para evitar sobrecarga
    return NextResponse.json(results.slice(0, 20))
  } catch (error) {
    console.error('Error searching catalog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

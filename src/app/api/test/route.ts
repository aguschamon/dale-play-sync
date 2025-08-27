import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    console.log('🔍 Probando Prisma manualmente...')
    
    // Crear cliente manualmente
    const prisma = new PrismaClient()
    console.log('✅ Cliente Prisma creado manualmente')
    
    // Verificar qué modelos están disponibles
    const modelos = Object.keys(prisma)
    console.log('📋 Modelos disponibles:', modelos)
    
    // Verificar que prisma.titular existe
    if (!prisma.titular) {
      console.log('❌ prisma.titular es undefined')
      return NextResponse.json({ 
        error: 'prisma.titular no está definido',
        modelosDisponibles: modelos
      }, { status: 500 })
    }
    
    console.log('✅ prisma.titular está definido')
    
    // Verificar que la tabla existe
    const count = await prisma.titular.count()
    console.log(`✅ Count de titulares: ${count}`)
    
    // Probar una consulta simple
    const titulares = await prisma.titular.findMany({
      take: 1
    })
    
    console.log(`✅ Consulta simple exitosa: ${titulares.length} titulares`)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      count,
      sample: titulares[0]?.nombre || 'No hay titulares'
    })
    
  } catch (error) {
    console.error('❌ Error en test:', error)
    return NextResponse.json({
      error: 'Error en test',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

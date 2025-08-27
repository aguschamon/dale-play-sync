import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de aprobaciones...')

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...')
    await prisma.aprobacion.deleteMany()
    console.log('✅ Datos existentes eliminados')

    // Obtener oportunidades existentes
    const opportunities = await prisma.oportunidad.findMany({
      include: {
        cliente: true
      }
    })

    // Obtener titulares existentes
    const titulares = await prisma.titular.findMany()

    if (opportunities.length === 0) {
      console.log('❌ No hay oportunidades disponibles. Ejecuta primero el seed de oportunidades.')
      return
    }

    if (titulares.length === 0) {
      console.log('❌ No hay titulares disponibles. Ejecuta primero el seed de titulares.')
      return
    }

    console.log(`📊 Encontradas ${opportunities.length} oportunidades y ${titulares.length} titulares`)

    const aprobaciones = []

    // 1. APROBACIONES PENDIENTES (2-3 aprobaciones)
    
    // Stranger Things Season 5 (INBOUND, APPROVAL) - 2 aprobaciones pendientes
    const strangerThings = opportunities.find(o => o.proyecto === 'Stranger Things Season 5')
    if (strangerThings) {
      // Bizarrap necesita aprobar
      const bizarrap = titulares.find(t => t.nombre.includes('Bizarrap'))
      if (bizarrap) {
        aprobaciones.push({
          oportunidad_id: strangerThings.id,
          titular_id: bizarrap.id,
          estado: 'PENDIENTE',
          token: crypto.randomUUID(),
          fecha_envio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
          comentarios: 'Pendiente de respuesta del titular'
        })
      }

      // Rosalía necesita aprobar
      const rosalia = titulares.find(t => t.nombre.includes('Rosalía'))
      if (rosalia) {
        aprobaciones.push({
          oportunidad_id: strangerThings.id,
          titular_id: rosalia.id,
          estado: 'PENDIENTE',
          token: crypto.randomUUID(),
          fecha_envio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
          comentarios: 'Email enviado, esperando confirmación'
        })
      }
    }

    // The Last Dance: Latin Music (INBOUND, SIGNED) - 1 aprobación pendiente
    const lastDance = opportunities.find(o => o.proyecto === 'The Last Dance: Latin Music')
    if (lastDance) {
      const delaossa = titulares.find(t => t.nombre.includes('Delaossa'))
      if (delaossa) {
        aprobaciones.push({
          oportunidad_id: lastDance.id,
          titular_id: delaossa.id,
          estado: 'PENDIENTE',
          token: crypto.randomUUID(),
          fecha_envio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
          comentarios: 'Documental sobre música latina - pendiente de aprobación'
        })
      }
    }

    // 2. APROBACIONES APROBADAS (1-2 aprobaciones)
    
    // Marvel's Spider-Man (OUTBOUND, LEGAL) - 1 aprobación aprobada
    const spiderMan = opportunities.find(o => o.proyecto === 'Marvel\'s Spider-Man: Freshman Year')
    if (spiderMan) {
      const miloJ = titulares.find(t => t.nombre.includes('Milo J'))
      if (miloJ) {
        aprobaciones.push({
          oportunidad_id: spiderMan.id,
          titular_id: miloJ.id,
          estado: 'APROBADO',
          token: crypto.randomUUID(),
          fecha_envio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
          fecha_respuesta: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
          comentarios: 'Aprobado para uso en serie animada'
        })
      }
    }

    // Ted Lasso Season 4 (OUTBOUND, NEGOTIATION) - 1 aprobación aprobada
    const tedLasso = opportunities.find(o => o.proyecto === 'Ted Lasso Season 4')
    if (tedLasso) {
      const badBunny = titulares.find(t => t.nombre.includes('Bad Bunny'))
      if (badBunny) {
        aprobaciones.push({
          oportunidad_id: tedLasso.id,
          titular_id: badBunny.id,
          estado: 'APROBADO',
          token: crypto.randomUUID(),
          fecha_envio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
          fecha_respuesta: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 días atrás
          comentarios: 'Aprobado para uso en escena emocional'
        })
      }
    }

    // 3. APROBACIONES RECHAZADAS (1 aprobación)
    
    // Super Bowl Commercial (OUTBOUND, PITCHING) - 1 aprobación rechazada
    const superBowl = opportunities.find(o => o.proyecto === 'Super Bowl 2025 Commercial')
    if (superBowl) {
      const shakira = titulares.find(t => t.nombre.includes('Shakira'))
      if (shakira) {
        aprobaciones.push({
          oportunidad_id: superBowl.id,
          titular_id: shakira.id,
          estado: 'RECHAZADO',
          token: crypto.randomUUID(),
          fecha_envio: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 días atrás
          fecha_respuesta: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 días atrás
          comentarios: 'Rechazado por conflicto de agenda - no disponible para Super Bowl'
        })
      }
    }

    // Crear las aprobaciones en la base de datos
    console.log('📝 Creando aprobaciones...')
    const createdAprobaciones = await prisma.aprobacion.createMany({
      data: aprobaciones
    })

    console.log(`✅ ${createdAprobaciones.count} aprobaciones creadas exitosamente`)

    // Mostrar resumen
    console.log('\n📊 Resumen de Aprobaciones:')
    console.log(`   • PENDIENTES: ${aprobaciones.filter(a => a.estado === 'PENDIENTE').length}`)
    console.log(`   • APROBADAS: ${aprobaciones.filter(a => a.estado === 'APROBADO').length}`)
    console.log(`   • RECHAZADAS: ${aprobaciones.filter(a => a.estado === 'RECHAZADO').length}`)
    console.log(`   • Total: ${aprobaciones.length}`)

    // Mostrar detalles por oportunidad
    console.log('\n🎯 Aprobaciones por Oportunidad:')
    for (const aprobacion of aprobaciones) {
      const oportunidad = opportunities.find(o => o.id === aprobacion.oportunidad_id)
      const titular = titulares.find(t => t.id === aprobacion.titular_id)
      
      if (oportunidad && titular) {
        console.log(`   • ${oportunidad.proyecto} - ${titular.nombre}: ${aprobacion.estado}`)
      }
    }

    console.log('\n🚀 Script ejecutado correctamente')

  } catch (error) {
    console.error('❌ Error durante el seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

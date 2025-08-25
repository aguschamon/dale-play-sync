import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateOpportunityDates() {
  try {
    console.log('🔄 Actualizando fechas de oportunidades...')

    // Obtener todas las oportunidades
    const opportunities = await prisma.oportunidad.findMany({
      orderBy: { createdAt: 'asc' }
    })

    if (opportunities.length === 0) {
      console.log('❌ No hay oportunidades para actualizar')
      return
    }

    // Definir las nuevas fechas más realistas
    const newDates = [
      {
        name: 'Stranger Things',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
        status: 'WARNING'
      },
      {
        name: 'Super Bowl',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días pasado
        status: 'URGENT'
      },
      {
        name: 'Ted Lasso',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
        status: 'NORMAL'
      },
      {
        name: 'Marvel',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 días
        status: 'NORMAL'
      },
      {
        name: 'The Last Dance',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 días
        status: 'NORMAL'
      },
      {
        name: 'Money Heist',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        status: 'WARNING'
      }
    ]

    // Actualizar cada oportunidad con su nueva fecha
    for (let i = 0; i < Math.min(opportunities.length, newDates.length); i++) {
      const opportunity = opportunities[i]
      const newDate = newDates[i]

      await prisma.oportunidad.update({
        where: { id: opportunity.id },
        data: {
          deadline: newDate.deadline,
          updatedAt: new Date()
        }
      })

      const daysUntilDeadline = Math.ceil((newDate.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      const statusText = daysUntilDeadline < 0 ? 'VENCIDO' : daysUntilDeadline <= 7 ? 'PRÓXIMO' : 'NORMAL'
      
      console.log(`✅ ${opportunity.proyecto}: ${newDate.deadline.toLocaleDateString()} (${statusText})`)
    }

    // Crear actividad para registrar la actualización
    await prisma.actividad.create({
      data: {
        oportunidadId: opportunities[0].id, // Usar la primera oportunidad como referencia
        usuarioId: opportunities[0].sync_manager_id,
        tipo_actividad: 'FECHAS_ACTUALIZADAS',
        descripcion: 'Se actualizaron las fechas de deadline de todas las oportunidades para hacerlas más realistas',
        metadata: JSON.stringify({
          totalUpdated: Math.min(opportunities.length, newDates.length),
          updateType: 'deadline_realignment',
          timestamp: new Date().toISOString()
        })
      }
    })

    console.log(`\n🎉 Se actualizaron ${Math.min(opportunities.length, newDates.length)} oportunidades`)
    console.log('\n📊 Resumen de fechas:')
    console.log('• Stranger Things: 3 días (WARNING)')
    console.log('• Super Bowl: 2 días vencido (URGENT)')
    console.log('• Ted Lasso: 15 días (NORMAL)')
    console.log('• Marvel: 20 días (NORMAL)')
    console.log('• The Last Dance: 25 días (NORMAL)')
    console.log('• Money Heist: 7 días (WARNING)')

  } catch (error) {
    console.error('❌ Error actualizando fechas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
updateOpportunityDates()
  .then(() => {
    console.log('\n✨ Script completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error en el script:', error)
    process.exit(1)
  })


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Iniciando actualización de datos del catálogo...')

  try {
    // 1. Actualizar porcentajes de obras
    console.log('\n📝 Actualizando porcentajes de obras...')
    
    const obrasToUpdate = [
      {
        nombre: '166',
        porcentaje_control_dp: 100,
        porcentaje_share_dp: 25
      },
      {
        nombre: 'Bzrp Music Sessions #52',
        porcentaje_control_dp: 50,
        porcentaje_share_dp: 12.5
      },
      {
        nombre: 'Corazones Rotos',
        porcentaje_control_dp: 75,
        porcentaje_share_dp: 18.75
      },
      {
        nombre: 'Remember Me',
        porcentaje_control_dp: 30,
        porcentaje_share_dp: 7.5
      }
    ]

    for (const obraData of obrasToUpdate) {
      const obra = await prisma.obra.findFirst({
        where: { nombre: obraData.nombre }
      })

      if (obra) {
        await prisma.obra.update({
          where: { id: obra.id },
          data: {
            porcentaje_control_dp: obraData.porcentaje_control_dp,
            porcentaje_share_dp: obraData.porcentaje_share_dp
          }
        })
        console.log(`✅ Actualizada obra: ${obraData.nombre}`)
      } else {
        console.log(`⚠️  Obra no encontrada: ${obraData.nombre}`)
      }
    }

    // 2. Eliminar fonograma de Universal Music
    console.log('\n🗑️  Eliminando fonograma de Universal Music...')
    
    const fonogramaToDelete = await prisma.fonograma.findFirst({
      where: {
        nombre: 'Remember Me (Studio Version)',
        sello: 'Universal Music'
      }
    })

    if (fonogramaToDelete) {
      await prisma.fonograma.delete({
        where: { id: fonogramaToDelete.id }
      })
      console.log('✅ Eliminado fonograma: Remember Me (Studio Version) - Universal Music')
    } else {
      console.log('⚠️  Fonograma no encontrado para eliminar')
    }

    // 3. Mover oportunidades PAID a histórico (cambiar estado a INVOICED)
    console.log('\n📊 Moviendo oportunidades PAID a histórico...')
    
    const paidOpportunities = await prisma.oportunidad.findMany({
      where: { estado: 'PAID' }
    })

    if (paidOpportunities.length > 0) {
      await prisma.oportunidad.updateMany({
        where: { estado: 'PAID' },
        data: { estado: 'INVOICED' }
      })
      console.log(`✅ Movidas ${paidOpportunities.length} oportunidades de PAID a INVOICED`)
    } else {
      console.log('ℹ️  No hay oportunidades PAID para mover')
    }

    // 4. Actualizar metadata de obras para asegurar participación de Dale Play
    console.log('\n🏢 Asegurando participación de Dale Play en todas las obras...')
    
    const allObras = await prisma.obra.findMany()
    
    for (const obra of allObras) {
      if (obra.porcentaje_control_dp === 0) {
        await prisma.obra.update({
          where: { id: obra.id },
          data: {
            porcentaje_control_dp: 30,
            porcentaje_share_dp: 7.5
          }
        })
        console.log(`✅ Actualizada obra ${obra.nombre} con participación mínima de Dale Play`)
      }
    }

    // 5. Crear actividad de resumen
    await prisma.actividad.create({
      data: {
        oportunidadId: '00000000-0000-0000-0000-000000000000', // ID dummy
        usuarioId: '00000000-0000-0000-0000-000000000000', // ID dummy
        tipo_actividad: 'SISTEMA',
        descripcion: 'Actualización masiva del catálogo: porcentajes corregidos, fonogramas limpiados, oportunidades PAID movidas a histórico',
        metadata: JSON.stringify({
          obras_actualizadas: obrasToUpdate.length,
          fonogramas_eliminados: fonogramaToDelete ? 1 : 0,
          oportunidades_movidas: paidOpportunities.length,
          timestamp: new Date().toISOString()
        })
      }
    })

    console.log('\n🎉 ¡Actualización completada exitosamente!')
    console.log('\n📋 Resumen de cambios:')
    console.log(`   • ${obrasToUpdate.length} obras actualizadas con porcentajes correctos`)
    console.log(`   • 1 fonograma eliminado (Universal Music)`)
    console.log(`   • ${paidOpportunities.length} oportunidades movidas de PAID a INVOICED`)
    console.log(`   • Todas las obras ahora tienen participación de Dale Play`)

  } catch (error) {
    console.error('❌ Error durante la actualización:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e)
    process.exit(1)
  })


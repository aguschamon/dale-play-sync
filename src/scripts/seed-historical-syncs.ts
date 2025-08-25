import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface HistoricalSync {
  proyecto: string
  cliente: string
  budget: number
  cancion: string
  mesesAtras: number
  tipo_proyecto: 'SERIE' | 'PELICULA' | 'PUBLICIDAD' | 'VIDEOJUEGO'
  territorio: string
  duracion_licencia: string
  tipo_uso: string
}

async function seedHistoricalSyncs() {
  try {
    console.log('🔄 Agregando sincronizaciones históricas...')

    // Crear o obtener un usuario para las relaciones
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'sync@daleplay.com',
          nombre: 'Sync Manager',
          rol: 'SYNC_MANAGER',
          permisos: JSON.stringify(['opportunities:create', 'opportunities:edit', 'catalog:read'])
        }
      })
      console.log('✅ Usuario creado: Sync Manager')
    }

    // Definir las sincronizaciones históricas
    const historicalSyncs: HistoricalSync[] = [
      {
        proyecto: "La Casa de Papel",
        cliente: "Netflix",
        budget: 75000,
        cancion: "Bzrp Sessions #52",
        mesesAtras: 3,
        tipo_proyecto: "SERIE",
        territorio: "Global",
        duracion_licencia: "5 años",
        tipo_uso: "Opening de serie"
      },
      {
        proyecto: "Breaking Bad: El Camino",
        cliente: "Netflix",
        budget: 50000,
        cancion: "166 de Milo J",
        mesesAtras: 6,
        tipo_proyecto: "SERIE",
        territorio: "Global",
        duracion_licencia: "3 años",
        tipo_uso: "Climax de episodio"
      },
      {
        proyecto: "Barbie Movie",
        cliente: "Warner Bros",
        budget: 150000,
        cancion: "Corazones Rotos",
        mesesAtras: 2,
        tipo_proyecto: "PELICULA",
        territorio: "Global",
        duracion_licencia: "10 años",
        tipo_uso: "Escena emocional"
      },
      {
        proyecto: "Champions League 2024",
        cliente: "Heineken",
        budget: 200000,
        cancion: "Remember Me",
        mesesAtras: 4,
        tipo_proyecto: "PUBLICIDAD",
        territorio: "Europa",
        duracion_licencia: "2 años",
        tipo_uso: "Spot publicitario"
      },
      {
        proyecto: "iPhone 15 Launch",
        cliente: "Apple",
        budget: 300000,
        cancion: "Bzrp Sessions #52",
        mesesAtras: 1,
        tipo_proyecto: "PUBLICIDAD",
        territorio: "Global",
        duracion_licencia: "5 años",
        tipo_uso: "Lanzamiento de producto"
      }
    ]

    // Obtener o crear clientes si no existen
    const clientes = await Promise.all(
      historicalSyncs.map(async (sync) => {
        let cliente = await prisma.cliente.findFirst({
          where: { nombre: sync.cliente }
        })

        if (!cliente) {
          cliente = await prisma.cliente.create({
            data: {
              nombre: sync.cliente,
              tipo: sync.cliente === 'Netflix' || sync.cliente === 'Apple' ? 'PLATAFORMA' : 
                    sync.cliente === 'Warner Bros' ? 'PRODUCTORA' : 'MARCA',
              contactos: JSON.stringify({
                email: `${sync.cliente.toLowerCase().replace(/\s+/g, '')}@example.com`,
                telefono: '+1-555-0123'
              }),
              metadata: JSON.stringify({
                industria: sync.cliente === 'Netflix' ? 'Streaming' : 
                          sync.cliente === 'Apple' ? 'Tecnología' : 
                          sync.cliente === 'Warner Bros' ? 'Entretenimiento' : 'Bebidas'
              })
            }
          })
          console.log(`✅ Cliente creado: ${sync.cliente}`)
        }

        return cliente
      })
    )

    // Obtener obras existentes o crear nuevas
    const obras = await Promise.all(
      historicalSyncs.map(async (sync) => {
        let obra = await prisma.obra.findFirst({
          where: { nombre: sync.cancion }
        })

        if (!obra) {
          obra = await prisma.obra.create({
            data: {
              nombre: sync.cancion,
              iswc: `ISWC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              porcentaje_control_dp: 50,
              porcentaje_share_dp: 12.5,
              compositores: JSON.stringify(['Bizarrap', 'Milo J', 'Otros']),
              territorio: "Global",
              metadata: JSON.stringify({
                genero: "Reggaeton",
                año: 2024,
                duracion: "3:45"
              })
            }
          })
          console.log(`✅ Obra creada: ${sync.cancion}`)
        }

        return obra
      })
    )

    // Crear las oportunidades históricas
    const opportunities = []
    for (let i = 0; i < historicalSyncs.length; i++) {
      const sync = historicalSyncs[i]
      const cliente = clientes[i]
      const obra = obras[i]

      // Calcular fechas basadas en meses atrás
      const fechaPagado = new Date()
      fechaPagado.setMonth(fechaPagado.getMonth() - sync.mesesAtras)
      
      const fechaFirmado = new Date(fechaPagado)
      fechaFirmado.setDate(fechaFirmado.getDate() - 7)
      
      const fechaLegal = new Date(fechaFirmado)
      fechaLegal.setDate(fechaLegal.getDate() - 14)
      
      const fechaAprobacion = new Date(fechaLegal)
      fechaAprobacion.setDate(fechaAprobacion.getDate() - 7)
      
      const fechaNegociacion = new Date(fechaAprobacion)
      fechaNegociacion.setDate(fechaNegociacion.getDate() - 14)
      
      const fechaPitching = new Date(fechaNegociacion)
      fechaPitching.setDate(fechaPitching.getDate() - 30)

      // Crear la oportunidad
      const oportunidad = await prisma.oportunidad.create({
        data: {
          codigo: `HIST-2024-${String(i + 1).padStart(4, '0')}`,
          tipo_flow: 'OUTBOUND',
          estado: 'PAID',
          cliente: {
            connect: { id: cliente.id }
          },
          syncManager: {
            connect: { id: user.id }
          },
          proyecto: sync.proyecto,
          tipo_proyecto: sync.tipo_proyecto,
          territorio: sync.territorio,
          duracion_licencia: sync.duracion_licencia,
          tipo_uso: sync.tipo_uso,
          budget: sync.budget,
          mfn: false,
          deadline: fechaPitching,
          metadata: JSON.stringify({
            tipo: 'sync_historico',
            cancion: sync.cancion,
            meses_atras: sync.mesesAtras
          }),
          createdAt: fechaPitching,
          updatedAt: fechaPagado
        }
      })

      // Crear la canción asociada
      await prisma.oportunidadCancion.create({
        data: {
          oportunidadId: oportunidad.id,
          obraId: obra.id,
          budget_cancion: sync.budget,
          nps_publishing: (sync.budget * 0.5) * (obra.porcentaje_share_dp / 100),
          nps_recording: 0, // Sin fonograma específico
          nps_total: (sync.budget * 0.5) * (obra.porcentaje_share_dp / 100)
        }
      })

      // Crear actividad para registrar el pago
      await prisma.actividad.create({
        data: {
          oportunidad: {
            connect: { id: oportunidad.id }
          },
          usuario: {
            connect: { id: user.id }
          },
          tipo_actividad: 'PAGO_COMPLETADO',
          descripcion: `Sincronización histórica "${sync.proyecto}" pagada por $${sync.budget.toLocaleString()}`,
          metadata: JSON.stringify({
            tipo: 'sync_historico',
            cancion: sync.cancion,
            meses_atras: sync.mesesAtras,
            revenue_generado: sync.budget
          }),
          createdAt: fechaPagado
        }
      })

      opportunities.push(oportunidad)
      console.log(`✅ Oportunidad histórica creada: ${sync.proyecto} - $${sync.budget.toLocaleString()}`)
    }

          // Crear resumen de actividad usando la primera oportunidad creada
      if (opportunities.length > 0) {
        await prisma.actividad.create({
          data: {
            oportunidad: {
              connect: { id: opportunities[0].id }
            },
            usuario: {
              connect: { id: user.id }
            },
            tipo_actividad: 'SEED_HISTORICO',
            descripcion: `Se agregaron ${historicalSyncs.length} sincronizaciones históricas con revenue total de $${historicalSyncs.reduce((sum, sync) => sum + sync.budget, 0).toLocaleString()}`,
            metadata: JSON.stringify({
              total_syncs: historicalSyncs.length,
              total_revenue: historicalSyncs.reduce((sum, sync) => sum + sync.budget, 0),
              syncs: historicalSyncs.map(sync => ({
                proyecto: sync.proyecto,
                budget: sync.budget,
                meses_atras: sync.mesesAtras
              }))
            }),
            createdAt: new Date()
          }
        })
      }

    console.log(`\n🎉 Se agregaron ${historicalSyncs.length} sincronizaciones históricas`)
    console.log('\n📊 Resumen de syncs históricos:')
    historicalSyncs.forEach((sync, index) => {
      console.log(`${index + 1}. ${sync.proyecto} - ${sync.cliente} - $${sync.budget.toLocaleString()} - ${sync.mesesAtras} meses atrás`)
    })

    const totalRevenue = historicalSyncs.reduce((sum, sync) => sum + sync.budget, 0)
    console.log(`\n💰 Revenue histórico total: $${totalRevenue.toLocaleString()}`)

  } catch (error) {
    console.error('❌ Error creando sincronizaciones históricas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
seedHistoricalSyncs()
  .then(() => {
    console.log('\n✨ Script de sincronizaciones históricas completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error en el script:', error)
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de oportunidades...')

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...')
    await prisma.actividad.deleteMany()
    await prisma.oportunidadCancion.deleteMany()
    await prisma.oportunidad.deleteMany()
    await prisma.cliente.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ Datos existentes eliminados')

    // Crear USUARIO DEL SISTEMA
    console.log('\n👤 Creando usuario del sistema...')
    const systemUser = await prisma.user.create({
      data: {
        email: "system@daleplay.com",
        nombre: "Sistema Dale Play",
        rol: "ADMIN",
        permisos: JSON.stringify(["*:read", "*:write"])
      }
    })
    console.log(`✅ Usuario del sistema creado: ${systemUser.nombre}`)

    // Crear CLIENTES
    console.log('\n🏢 Creando clientes...')

    const netflix = await prisma.cliente.create({
      data: {
        nombre: "Netflix",
        tipo: "PLATAFORMA",
        contactos: JSON.stringify([
          { nombre: "María González", email: "maria.gonzalez@netflix.com", telefono: "+1-555-0101" },
          { nombre: "Carlos Ruiz", email: "carlos.ruiz@netflix.com", telefono: "+1-555-0102" }
        ]),
        metadata: JSON.stringify({
          pais: "Estados Unidos",
          industria: "Streaming",
          prioridad: "ALTA"
        })
      }
    })
    console.log(`✅ Cliente creado: ${netflix.nombre}`)

    const appleTv = await prisma.cliente.create({
      data: {
        nombre: "Apple TV+",
        tipo: "PLATAFORMA",
        contactos: JSON.stringify([
          { nombre: "Ana Martínez", email: "ana.martinez@apple.com", telefono: "+1-555-0201" }
        ]),
        metadata: JSON.stringify({
          pais: "Estados Unidos",
          industria: "Streaming",
          prioridad: "ALTA"
        })
      }
    })
    console.log(`✅ Cliente creado: ${appleTv.nombre}`)

    const disney = await prisma.cliente.create({
      data: {
        nombre: "Disney+",
        tipo: "PLATAFORMA",
        contactos: JSON.stringify([
          { nombre: "Luis Fernández", email: "luis.fernandez@disney.com", telefono: "+1-555-0301" },
          { nombre: "Sofia Herrera", email: "sofia.herrera@disney.com", telefono: "+1-555-0302" }
        ]),
        metadata: JSON.stringify({
          pais: "Estados Unidos",
          industria: "Streaming",
          prioridad: "ALTA"
        })
      }
    })
    console.log(`✅ Cliente creado: ${disney.nombre}`)

    const hboMax = await prisma.cliente.create({
      data: {
        nombre: "HBO Max",
        tipo: "PLATAFORMA",
        contactos: JSON.stringify([
          { nombre: "Roberto Silva", email: "roberto.silva@hbomax.com", telefono: "+1-555-0401" }
        ]),
        metadata: JSON.stringify({
          pais: "Estados Unidos",
          industria: "Streaming",
          prioridad: "MEDIA"
        })
      }
    })
    console.log(`✅ Cliente creado: ${hboMax.nombre}`)

    const cocaCola = await prisma.cliente.create({
      data: {
        nombre: "Coca-Cola",
        tipo: "MARCA",
        contactos: JSON.stringify([
          { nombre: "Carmen Vega", email: "carmen.vega@coca-cola.com", telefono: "+1-555-0501" }
        ]),
        metadata: JSON.stringify({
          pais: "Estados Unidos",
          industria: "Bebidas",
          prioridad: "MEDIA"
        })
      }
    })
    console.log(`✅ Cliente creado: ${cocaCola.nombre}`)

    // Crear OPORTUNIDADES
    console.log('\n🎯 Creando oportunidades...')

    // 1. Netflix pidiendo Bzrp #52 (INBOUND, APPROVAL, $30,000)
    const oportunidad1 = await prisma.oportunidad.create({
      data: {
        codigo: "OPP-2025-0001",
        tipo_flow: "INBOUND",
        estado: "APPROVAL",
        clienteId: netflix.id,
        proyecto: "Stranger Things Season 5",
        tipo_proyecto: "SERIE",
        territorio: "Mundial",
        duracion_licencia: "5 años",
        tipo_uso: "Opening/Closing",
        budget: 30000,
        mfn: true,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días - URGENTE
        metadata: JSON.stringify({
          descripcion: "Necesitan Bzrp Music Sessions #52 para el opening de la nueva temporada",
          urgencia: "ALTA",
          notas: "Cliente específicamente pidió esta canción"
        }),
        sync_manager_id: systemUser.id,
        legal_id: systemUser.id,
        admin_id: systemUser.id
      }
    })
    console.log(`✅ Oportunidad creada: ${oportunidad1.proyecto} - ${oportunidad1.codigo}`)

    // 2. Apple TV interesado en 166 (OUTBOUND, NEGOTIATION, $25,000)
    const oportunidad2 = await prisma.oportunidad.create({
      data: {
        codigo: "OPP-2025-0002",
        tipo_flow: "OUTBOUND",
        estado: "NEGOTIATION",
        clienteId: appleTv.id,
        proyecto: "Ted Lasso Season 4",
        tipo_proyecto: "SERIE",
        territorio: "Mundial",
        duracion_licencia: "3 años",
        tipo_uso: "Background",
        budget: 25000,
        mfn: false,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
        metadata: JSON.stringify({
          descripcion: "Pitch de Milo J - 166 para escena emocional",
          urgencia: "MEDIA",
          notas: "Cliente mostró interés en la canción"
        }),
        sync_manager_id: systemUser.id,
        legal_id: systemUser.id,
        admin_id: systemUser.id
      }
    })
    console.log(`✅ Oportunidad creada: ${oportunidad2.proyecto} - ${oportunidad2.codigo}`)

    // 3. Disney+ con 3 canciones (OUTBOUND, LEGAL, $80,000)
    const oportunidad3 = await prisma.oportunidad.create({
      data: {
        codigo: "OPP-2025-0003",
        tipo_flow: "OUTBOUND",
        estado: "LEGAL",
        clienteId: disney.id,
        proyecto: "Marvel's Spider-Man: Freshman Year",
        tipo_proyecto: "SERIE",
        territorio: "Mundial",
        duracion_licencia: "10 años",
        tipo_uso: "Opening/Closing",
        budget: 80000,
        mfn: true,
        deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 días
        metadata: JSON.stringify({
          descripcion: "Paquete de 3 canciones: Bzrp #52, 166, y Corazones Rotos",
          urgencia: "MEDIA",
          notas: "En proceso de revisión legal"
        }),
        sync_manager_id: systemUser.id,
        legal_id: systemUser.id,
        admin_id: systemUser.id
      }
    })
    console.log(`✅ Oportunidad creada: ${oportunidad3.proyecto} - ${oportunidad3.codigo}`)

    // 4. HBO Max documentario (INBOUND, SIGNED, $50,000)
    const oportunidad4 = await prisma.oportunidad.create({
      data: {
        codigo: "OPP-2025-0004",
        tipo_flow: "INBOUND",
        estado: "SIGNED",
        clienteId: hboMax.id,
        proyecto: "The Last Dance: Latin Music",
        tipo_proyecto: "SERIE",
        territorio: "LATAM",
        duracion_licencia: "7 años",
        tipo_uso: "Background",
        budget: 50000,
        mfn: false,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días - URGENTE
        metadata: JSON.stringify({
          descripcion: "Documental sobre música latina usando Remember Me de Delaossa",
          urgencia: "BAJA",
          notas: "Contrato ya firmado, en proceso de facturación"
        }),
        sync_manager_id: systemUser.id,
        legal_id: systemUser.id,
        admin_id: systemUser.id
      }
    })
    console.log(`✅ Oportunidad creada: ${oportunidad4.proyecto} - ${oportunidad4.codigo}`)

    // 5. Coca-Cola Super Bowl (OUTBOUND, PITCHING, $120,000)
    const oportunidad5 = await prisma.oportunidad.create({
      data: {
        codigo: "OPP-2025-0005",
        tipo_flow: "OUTBOUND",
        estado: "PITCHING",
        clienteId: cocaCola.id,
        proyecto: "Super Bowl 2025 Commercial",
        tipo_proyecto: "PUBLICIDAD",
        territorio: "Estados Unidos",
        duracion_licencia: "1 año",
        tipo_uso: "Background",
        budget: 120000,
        mfn: true,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 días
        metadata: JSON.stringify({
          descripcion: "Pitch para comercial del Super Bowl con Bzrp Music Sessions #52",
          urgencia: "ALTA",
          notas: "Deadline crítico para el Super Bowl"
        }),
        sync_manager_id: systemUser.id,
        legal_id: systemUser.id,
        admin_id: systemUser.id
      }
    })
    console.log(`✅ Oportunidad creada: ${oportunidad5.proyecto} - ${oportunidad5.codigo}`)

    // 6. Netflix otra oportunidad (INBOUND, NEGOTIATION, $45,000)
    const oportunidad6 = await prisma.oportunidad.create({
      data: {
        codigo: "OPP-2025-0006",
        tipo_flow: "INBOUND",
        estado: "NEGOTIATION",
        clienteId: netflix.id,
        proyecto: "Money Heist: The Phenomenon",
        tipo_proyecto: "PELICULA",
        territorio: "Mundial",
        duracion_licencia: "Perpetua",
        tipo_uso: "Trailer",
        budget: 45000,
        mfn: false,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
        metadata: JSON.stringify({
          descripcion: "Película sobre el fenómeno de La Casa de Papel",
          urgencia: "MEDIA",
          notas: "Negociando términos de licencia perpetua"
        }),
        sync_manager_id: systemUser.id,
        legal_id: systemUser.id,
        admin_id: systemUser.id
      }
    })
    console.log(`✅ Oportunidad creada: ${oportunidad6.proyecto} - ${oportunidad6.codigo}`)

    // Crear ACTIVIDADES para cada oportunidad
    console.log('\n📝 Creando actividades...')

    const actividades = [
      {
        oportunidadId: oportunidad1.id,
        tipo_actividad: 'OPPORTUNITY_CREATED',
        descripcion: `Oportunidad ${oportunidad1.codigo} creada para ${oportunidad1.proyecto}`,
        metadata: JSON.stringify({
          estado_anterior: null,
          estado_nuevo: oportunidad1.estado,
          tipo_flow: oportunidad1.tipo_flow
        })
      },
      {
        oportunidadId: oportunidad2.id,
        tipo_actividad: 'OPPORTUNITY_CREATED',
        descripcion: `Oportunidad ${oportunidad2.codigo} creada para ${oportunidad2.proyecto}`,
        metadata: JSON.stringify({
          estado_anterior: null,
          estado_nuevo: oportunidad2.estado,
          tipo_flow: oportunidad2.tipo_flow
        })
      },
      {
        oportunidadId: oportunidad3.id,
        tipo_actividad: 'OPPORTUNITY_CREATED',
        descripcion: `Oportunidad ${oportunidad3.codigo} creada para ${oportunidad3.proyecto}`,
        metadata: JSON.stringify({
          estado_anterior: null,
          estado_nuevo: oportunidad3.estado,
          tipo_flow: oportunidad3.tipo_flow
        })
      },
      {
        oportunidadId: oportunidad4.id,
        tipo_actividad: 'OPPORTUNITY_CREATED',
        descripcion: `Oportunidad ${oportunidad4.codigo} creada para ${oportunidad4.proyecto}`,
        metadata: JSON.stringify({
          estado_anterior: null,
          estado_nuevo: oportunidad4.estado,
          tipo_flow: oportunidad4.tipo_flow
        })
      },
      {
        oportunidadId: oportunidad5.id,
        tipo_actividad: 'OPPORTUNITY_CREATED',
        descripcion: `Oportunidad ${oportunidad5.codigo} creada para ${oportunidad5.proyecto}`,
        metadata: JSON.stringify({
          estado_anterior: null,
          estado_nuevo: oportunidad5.estado,
          tipo_flow: oportunidad5.tipo_flow
        })
      },
      {
        oportunidadId: oportunidad6.id,
        tipo_actividad: 'OPPORTUNITY_CREATED',
        descripcion: `Oportunidad ${oportunidad6.codigo} creada para ${oportunidad6.proyecto}`,
        metadata: JSON.stringify({
          estado_anterior: null,
          estado_nuevo: oportunidad6.estado,
          tipo_flow: oportunidad6.tipo_flow
        })
      }
    ]

    for (const actividad of actividades) {
      await prisma.actividad.create({
        data: {
          ...actividad,
          usuarioId: systemUser.id
        }
      })
    }
    console.log(`✅ ${actividades.length} actividades creadas`)

    console.log('\n🎉 Seed de oportunidades completado exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`   • ${1} usuario del sistema creado`)
    console.log(`   • ${5} clientes creados`)
    console.log(`   • ${6} oportunidades creadas`)
    console.log(`   • ${3} oportunidades INBOUND`)
    console.log(`   • ${3} oportunidades OUTBOUND`)
    console.log(`   • ${2} oportunidades urgentes (deadline < 48h)`)
    console.log(`   • Budget total: $${(30000 + 25000 + 80000 + 50000 + 120000 + 45000).toLocaleString()}`)
    console.log(`   • Estados: PITCHING(1), NEGOTIATION(2), APPROVAL(1), LEGAL(1), SIGNED(1)`)

  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el seed
main()
  .then(() => {
    console.log('\n🚀 Script ejecutado correctamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error)
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de titulares...')

  try {
    // Crear titulares de ejemplo
    const titulares = [
      {
        nombre: 'Bizarrap',
        email: 'bizarrap@daleplay.com',
        telefono: '+54 11 1234-5678',
        tipo: 'ARTISTA',
        notas: 'Artista principal de Bzrp Music Sessions'
      },
      {
        nombre: 'Quevedo',
        email: 'quevedo@daleplay.com',
        telefono: '+34 91 1234-5678',
        tipo: 'ARTISTA',
        notas: 'Artista invitado en varias sesiones'
      },
      {
        nombre: 'Tainy',
        email: 'tainy@daleplay.com',
        telefono: '+1 787 123-4567',
        tipo: 'PRODUCTOR',
        notas: 'Productor de reggaeton y trap'
      },
      {
        nombre: 'Rauw Alejandro',
        email: 'rauw@daleplay.com',
        telefono: '+1 787 234-5678',
        tipo: 'ARTISTA',
        notas: 'Artista de reggaeton y trap'
      },
      {
        nombre: 'Anuel AA',
        email: 'anuel@daleplay.com',
        telefono: '+1 787 345-6789',
        tipo: 'ARTISTA',
        notas: 'Artista de reggaeton y trap'
      },
      {
        nombre: 'Bad Bunny',
        email: 'badbunny@daleplay.com',
        telefono: '+1 787 456-7890',
        tipo: 'ARTISTA',
        notas: 'Artista de reggaeton y trap'
      },
      {
        nombre: 'J Balvin',
        email: 'jbalvin@daleplay.com',
        telefono: '+57 4 123-4567',
        tipo: 'ARTISTA',
        notas: 'Artista de reggaeton y trap'
      },
      {
        nombre: 'Maluma',
        email: 'maluma@daleplay.com',
        telefono: '+57 4 234-5678',
        tipo: 'ARTISTA',
        notas: 'Artista de reggaeton y trap'
      },
      {
        nombre: 'Karol G',
        email: 'karolg@daleplay.com',
        telefono: '+57 4 345-6789',
        tipo: 'ARTISTA',
        notas: 'Artista de reggaeton y trap'
      },
      {
        nombre: 'Nicky Jam',
        email: 'nickyjam@daleplay.com',
        telefono: '+1 617 123-4567',
        tipo: 'ARTISTA',
        notas: 'Artista de reggaeton y trap'
      }
    ]

    console.log('📝 Creando titulares...')
    
    for (const titularData of titulares) {
      const titular = await prisma.titular.create({
        data: titularData
      })
      console.log(`✅ Creado titular: ${titular.nombre}`)
    }

    // Crear algunas relaciones con obras existentes
    console.log('🔗 Creando relaciones con obras...')
    
    // Obtener obras existentes
    const obras = await prisma.obra.findMany()
    const titularesCreados = await prisma.titular.findMany()
    
    if (obras.length > 0 && titularesCreados.length > 0) {
      // Asignar algunos titulares a obras
      const relacionesObra = [
        {
          titular_id: titularesCreados[0].id, // Bizarrap
          obra_id: obras[0].id,
          porcentaje: 50.0,
          rol: 'COMPOSITOR'
        },
        {
          titular_id: titularesCreados[1].id, // Quevedo
          obra_id: obras[0].id,
          porcentaje: 50.0,
          rol: 'AUTOR_LETRA'
        },
        {
          titular_id: titularesCreados[2].id, // Tainy
          obra_id: obras[1].id,
          porcentaje: 100.0,
          rol: 'COMPOSITOR'
        }
      ]

      for (const relacion of relacionesObra) {
        await prisma.titularObra.create({
          data: relacion
        })
        console.log(`✅ Creada relación obra-titular`)
      }
    }

    // Crear algunas relaciones con fonogramas existentes
    console.log('🔗 Creando relaciones con fonogramas...')
    
    const fonogramas = await prisma.fonograma.findMany()
    
    if (fonogramas.length > 0) {
      const relacionesFonograma = [
        {
          titular_id: titularesCreados[0].id, // Bizarrap
          fonograma_id: fonogramas[0].id,
          porcentaje: 100.0,
          rol: 'ARTISTA'
        },
        {
          titular_id: titularesCreados[1].id, // Quevedo
          fonograma_id: fonogramas[0].id,
          porcentaje: 50.0,
          rol: 'FEATURED'
        },
        {
          titular_id: titularesCreados[2].id, // Tainy
          fonograma_id: fonogramas[0].id,
          porcentaje: 100.0,
          rol: 'PRODUCTOR'
        }
      ]

      for (const relacion of relacionesFonograma) {
        await prisma.titularFonograma.create({
          data: relacion
        })
        console.log(`✅ Creada relación fonograma-titular`)
      }
    }

    console.log('🎉 Seed de titulares completado exitosamente!')
    console.log(`📊 Total de titulares creados: ${titulares.length}`)
    
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

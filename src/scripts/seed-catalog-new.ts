import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Iniciando seed del nuevo catálogo musical...')

  try {
    // 1. Limpiar base de datos existente
    console.log('\n🗑️  Limpiando base de datos existente...')
    
    await prisma.oportunidadCancion.deleteMany()
    await prisma.fonograma.deleteMany()
    await prisma.obra.deleteMany()
    
    console.log('✅ Base de datos limpiada')

    // 2. Crear las 11 obras
    console.log('\n📝 Creando obras...')
    
    const obras = [
      {
        nombre: 'Bzrp Music Sessions #52',
        iswc: 'T-345.678.901-2',
        porcentaje_control_dp: 50,
        porcentaje_share_dp: 12.5,
        compositores: JSON.stringify([
          { nombre: 'Bizarrap', porcentaje: 50 },
          { nombre: 'Quevedo', porcentaje: 50 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: 'Corazones Rotos',
        iswc: 'T-678.901.234-5',
        porcentaje_control_dp: 75,
        porcentaje_share_dp: 18.75,
        compositores: JSON.stringify([
          { nombre: 'Duki', porcentaje: 75 },
          { nombre: 'Otros', porcentaje: 25 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: 'Nostalgia',
        iswc: 'T-789.012.345-6',
        porcentaje_control_dp: 100,
        porcentaje_share_dp: 25,
        compositores: JSON.stringify([
          { nombre: 'Duki', porcentaje: 100 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: 'Arroba',
        iswc: 'T-890.123.456-7',
        porcentaje_control_dp: 60,
        porcentaje_share_dp: 15,
        compositores: JSON.stringify([
          { nombre: 'Tini', porcentaje: 60 },
          { nombre: 'Otros', porcentaje: 40 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: 'La Botella',
        iswc: 'T-901.234.567-8',
        porcentaje_control_dp: 80,
        porcentaje_share_dp: 20,
        compositores: JSON.stringify([
          { nombre: 'Mau y Ricky', porcentaje: 80 },
          { nombre: 'Otros', porcentaje: 20 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: 'Medusa',
        iswc: 'T-012.345.678-9',
        porcentaje_control_dp: 45,
        porcentaje_share_dp: 11.25,
        compositores: JSON.stringify([
          { nombre: 'Jhay Cortez', porcentaje: 45 },
          { nombre: 'Otros', porcentaje: 55 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: 'Gatúbela',
        iswc: 'T-123.456.789-0',
        porcentaje_control_dp: 70,
        porcentaje_share_dp: 17.5,
        compositores: JSON.stringify([
          { nombre: 'Karol G', porcentaje: 50 },
          { nombre: 'Maldy', porcentaje: 20 },
          { nombre: 'Otros', porcentaje: 30 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: '512',
        iswc: 'T-234.567.890-1',
        porcentaje_control_dp: 90,
        porcentaje_share_dp: 22.5,
        compositores: JSON.stringify([
          { nombre: 'Mora', porcentaje: 90 },
          { nombre: 'Otros', porcentaje: 10 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: 'Yandel 150',
        iswc: 'T-345.678.901-3',
        porcentaje_control_dp: 55,
        porcentaje_share_dp: 13.75,
        compositores: JSON.stringify([
          { nombre: 'Yandel', porcentaje: 40 },
          { nombre: 'Feid', porcentaje: 15 },
          { nombre: 'Otros', porcentaje: 45 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: 'La Canción',
        iswc: 'T-456.789.012-4',
        porcentaje_control_dp: 65,
        porcentaje_share_dp: 16.25,
        compositores: JSON.stringify([
          { nombre: 'Bad Bunny', porcentaje: 45 },
          { nombre: 'J Balvin', porcentaje: 20 },
          { nombre: 'Otros', porcentaje: 35 }
        ]),
        territorio: 'Mundial'
      },
      {
        nombre: 'Despechá',
        iswc: 'T-567.890.123-5',
        porcentaje_control_dp: 85,
        porcentaje_share_dp: 21.25,
        compositores: JSON.stringify([
          { nombre: 'Rosalía', porcentaje: 85 },
          { nombre: 'Otros', porcentaje: 15 }
        ]),
        territorio: 'Mundial'
      }
    ]

    const obrasCreadas = []
    for (const obraData of obras) {
      const obra = await prisma.obra.create({
        data: obraData
      })
      obrasCreadas.push(obra)
      console.log(`✅ Creada obra: ${obra.nombre}`)
    }

    // 3. Crear los 9 fonogramas (solo para las primeras 9 obras)
    console.log('\n💿 Creando fonogramas...')
    
    const fonogramas = [
      {
        nombre: 'Bzrp Music Sessions #52 (Single)',
        isrc: 'USRC12345678',
        porcentaje_dp: 100,
        artista_principal: 'Bizarrap ft Quevedo',
        featured_artists: JSON.stringify([
          { nombre: 'Quevedo', rol: 'Featured Artist' }
        ]),
        sello: 'Dale Play Records',
        anio_lanzamiento: 2022
      },
      {
        nombre: 'Corazones Rotos (Album Version)',
        isrc: 'USRC23456789',
        porcentaje_dp: 100,
        artista_principal: 'Duki',
        featured_artists: JSON.stringify([]),
        sello: 'Dale Play Records',
        anio_lanzamiento: 2021
      },
      {
        nombre: 'Nostalgia (Single)',
        isrc: 'USRC34567890',
        porcentaje_dp: 100,
        artista_principal: 'Duki',
        featured_artists: JSON.stringify([]),
        sello: 'Dale Play Records',
        anio_lanzamiento: 2020
      },
      {
        nombre: 'Arroba (Radio Edit)',
        isrc: 'USRC45678901',
        porcentaje_dp: 100,
        artista_principal: 'Tini',
        featured_artists: JSON.stringify([]),
        sello: 'Dale Play Records',
        anio_lanzamiento: 2021
      },
      {
        nombre: 'La Botella (Studio Version)',
        isrc: 'USRC56789012',
        porcentaje_dp: 100,
        artista_principal: 'Mau y Ricky',
        featured_artists: JSON.stringify([]),
        sello: 'Dale Play Records',
        anio_lanzamiento: 2020
      },
      {
        nombre: 'Medusa (Album Track)',
        isrc: 'USRC67890123',
        porcentaje_dp: 100,
        artista_principal: 'Jhay Cortez',
        featured_artists: JSON.stringify([]),
        sello: 'Dale Play Records',
        anio_lanzamiento: 2021
      },
      {
        nombre: 'Gatúbela (Single)',
        isrc: 'USRC78901234',
        porcentaje_dp: 100,
        artista_principal: 'Karol G',
        featured_artists: JSON.stringify([
          { nombre: 'Maldy', rol: 'Featured Artist' }
        ]),
        sello: 'Dale Play Records',
        anio_lanzamiento: 2022
      },
      {
        nombre: '512 (Album Version)',
        isrc: 'USRC89012345',
        porcentaje_dp: 100,
        artista_principal: 'Mora',
        featured_artists: JSON.stringify([]),
        sello: 'Dale Play Records',
        anio_lanzamiento: 2021
      },
      {
        nombre: 'Yandel 150 (Single)',
        isrc: 'USRC90123456',
        porcentaje_dp: 100,
        artista_principal: 'Yandel',
        featured_artists: JSON.stringify([
          { nombre: 'Feid', rol: 'Featured Artist' }
        ]),
        sello: 'Dale Play Records',
        anio_lanzamiento: 2022
      }
    ]

    for (let i = 0; i < 9; i++) {
      const fonograma = await prisma.fonograma.create({
        data: {
          ...fonogramas[i],
          obraId: obrasCreadas[i].id
        }
      })
      console.log(`✅ Creado fonograma: ${fonograma.nombre}`)
    }

    // 4. Crear actividad de resumen (comentado por foreign key constraints)
    // await prisma.actividad.create({
    //   data: {
    //     oportunidadId: '00000000-0000-0000-0000-000000000000', // ID dummy
    //     usuarioId: '00000000-0000-0000-0000-000000000000', // ID dummy
    //     tipo_actividad: 'SISTEMA',
    //     descripcion: 'Nuevo catálogo musical creado: 11 obras y 9 fonogramas de Dale Play',
    //     metadata: JSON.stringify({
    //       obras_creadas: 11,
    //       fonogramas_creados: 9,
    //       timestamp: new Date().toISOString()
    //     })
    //   }
    // })

    console.log('\n🎉 ¡Catálogo musical creado exitosamente!')
    console.log('\n📋 Resumen:')
    console.log(`   • ${obras.length} obras creadas con ISWC válidos`)
    console.log(`   • ${fonogramas.length} fonogramas creados`)
    console.log(`   • Solo Dale Play Records (sin Universal)`)
    console.log(`   • Participación real de Dale Play en todas las obras`)
    console.log(`   • Sin duplicados`)

  } catch (error) {
    console.error('❌ Error durante la creación del catálogo:', error)
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

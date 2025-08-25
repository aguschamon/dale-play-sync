import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed del catálogo...')

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...')
    await prisma.oportunidadCancion.deleteMany()
    await prisma.fonograma.deleteMany()
    await prisma.obra.deleteMany()
    
    console.log('✅ Datos existentes eliminados')

    // Crear OBRAS (Publishing)
    console.log('\n📝 Creando obras...')

    const obra1 = await prisma.obra.create({
      data: {
        nombre: "Bzrp Music Sessions #52",
        iswc: "T-345.678.901-2",
        porcentaje_control_dp: 50,
        porcentaje_share_dp: 12.5,
        compositores: JSON.stringify([
          { nombre: "Bizarrap", porcentaje: 25 },
          { nombre: "Quevedo", porcentaje: 25 },
          { nombre: "Dale Play Publishing", porcentaje: 50 }
        ]),
        territorio: "Mundial"
      }
    })
    console.log(`✅ Obra creada: ${obra1.nombre}`)

    const obra2 = await prisma.obra.create({
      data: {
        nombre: "166",
        iswc: "T-456.789.012-3",
        porcentaje_control_dp: 100,
        porcentaje_share_dp: 25,
        compositores: JSON.stringify([
          { nombre: "Milo J", porcentaje: 50 },
          { nombre: "Dale Play Publishing", porcentaje: 50 }
        ]),
        territorio: "LATAM"
      }
    })
    console.log(`✅ Obra creada: ${obra2.nombre}`)

    const obra3 = await prisma.obra.create({
      data: {
        nombre: "Remember Me",
        iswc: "T-567.890.123-4",
        porcentaje_control_dp: 0,
        porcentaje_share_dp: 0,
        compositores: JSON.stringify([
          { nombre: "Delaossa", porcentaje: 100 }
        ]),
        territorio: "Mundial"
      }
    })
    console.log(`✅ Obra creada: ${obra3.nombre}`)

    const obra4 = await prisma.obra.create({
      data: {
        nombre: "Corazones Rotos",
        iswc: "T-678.901.234-5",
        porcentaje_control_dp: 75,
        porcentaje_share_dp: 18.75,
        compositores: JSON.stringify([
          { nombre: "Nicki Nicole", porcentaje: 25 },
          { nombre: "Dale Play Publishing", porcentaje: 75 }
        ]),
        territorio: "LATAM"
      }
    })
    console.log(`✅ Obra creada: ${obra4.nombre}`)

    // Crear FONOGRAMAS (Records)
    console.log('\n💿 Creando fonogramas...')

    const fonograma1 = await prisma.fonograma.create({
      data: {
        obraId: obra1.id,
        nombre: "Bzrp Music Sessions #52 (Original)",
        isrc: "ES-XXX-24-00001",
        porcentaje_dp: 30,
        artista_principal: "Bizarrap ft. Quevedo",
        featured_artists: JSON.stringify([
          { nombre: "Quevedo", rol: "Featured Artist" }
        ]),
        sello: "Dale Play Records",
        anio_lanzamiento: 2024
      }
    })
    console.log(`✅ Fonograma creado: ${fonograma1.nombre}`)

    const fonograma2 = await prisma.fonograma.create({
      data: {
        obraId: obra2.id,
        nombre: "166 (Original Mix)",
        isrc: "AR-XXX-24-00002",
        porcentaje_dp: 100,
        artista_principal: "Milo J",
        featured_artists: null,
        sello: "Dale Play Records",
        anio_lanzamiento: 2024
      }
    })
    console.log(`✅ Fonograma creado: ${fonograma2.nombre}`)

    const fonograma3 = await prisma.fonograma.create({
      data: {
        obraId: obra3.id,
        nombre: "Remember Me (Studio Version)",
        isrc: "ES-XXX-24-00003",
        porcentaje_dp: 30,
        artista_principal: "Delaossa",
        featured_artists: null,
        sello: "Universal Music",
        anio_lanzamiento: 2023
      }
    })
    console.log(`✅ Fonograma creado: ${fonograma3.nombre}`)

    // Crear algunos fonogramas adicionales para las otras obras
    const fonograma4 = await prisma.fonograma.create({
      data: {
        obraId: obra4.id,
        nombre: "Corazones Rotos (Radio Edit)",
        isrc: "AR-XXX-24-00004",
        porcentaje_dp: 75,
        artista_principal: "Nicki Nicole",
        featured_artists: null,
        sello: "Dale Play Records",
        anio_lanzamiento: 2024
      }
    })
    console.log(`✅ Fonograma creado: ${fonograma4.nombre}`)

    // Crear un fonograma remix para Bzrp Music Sessions #52
    const fonograma5 = await prisma.fonograma.create({
      data: {
        obraId: obra1.id,
        nombre: "Bzrp Music Sessions #52 (Remix)",
        isrc: "ES-XXX-24-00005",
        porcentaje_dp: 25,
        artista_principal: "Bizarrap ft. Quevedo",
        featured_artists: JSON.stringify([
          { nombre: "Quevedo", rol: "Featured Artist" },
          { nombre: "Duki", rol: "Remix Artist" }
        ]),
        sello: "Dale Play Records",
        anio_lanzamiento: 2024
      }
    })
    console.log(`✅ Fonograma creado: ${fonograma5.nombre}`)

    console.log('\n🎉 Seed del catálogo completado exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`   • ${4} obras creadas`)
    console.log(`   • ${5} fonogramas creados`)
    console.log(`   • ${2} obras con territorio LATAM`)
    console.log(`   • ${2} obras con territorio Mundial`)
    console.log(`   • ${3} fonogramas en Dale Play Records`)
    console.log(`   • ${1} fonograma en Universal Music`)

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


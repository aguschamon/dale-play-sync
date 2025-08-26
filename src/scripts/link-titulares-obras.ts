import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔗 Iniciando vinculación de obras con titulares...')
  
  try {
    // Limpiar relaciones existentes
    await prisma.titularObra.deleteMany()
    console.log('🧹 Relaciones anteriores eliminadas')
    
    // Buscar obras por nombre
    const bzrp52 = await prisma.obra.findFirst({ where: { nombre: { contains: 'Bzrp Music Sessions #52' } } })
    const despecha = await prisma.obra.findFirst({ where: { nombre: { contains: 'Despechá' } } })
    const corazones = await prisma.obra.findFirst({ where: { nombre: { contains: 'Corazones Rotos' } } })
    const nostalgia = await prisma.obra.findFirst({ where: { nombre: { contains: 'Nostalgia' } } })
    const arroba = await prisma.obra.findFirst({ where: { nombre: { contains: 'Arroba' } } })
    const gatubela = await prisma.obra.findFirst({ where: { nombre: { contains: 'Gatúbela' } } })
    const cancion = await prisma.obra.findFirst({ where: { nombre: { contains: 'La Canción' } } })
    const medusa = await prisma.obra.findFirst({ where: { nombre: { contains: 'Medusa' } } })
    
    // Buscar titulares por nombre
    const bizarrap = await prisma.titular.findFirst({ where: { nombre: { contains: 'Bizarrap' } } })
    const quevedo = await prisma.titular.findFirst({ where: { nombre: { contains: 'Quevedo' } } })
    const rosalia = await prisma.titular.findFirst({ where: { nombre: { contains: 'Rosalía' } } })
    const nicki = await prisma.titular.findFirst({ where: { nombre: { contains: 'Nicki Nicole' } } })
    const duki = await prisma.titular.findFirst({ where: { nombre: { contains: 'Duki' } } })
    const tini = await prisma.titular.findFirst({ where: { nombre: { contains: 'Tini' } } })
    const karol = await prisma.titular.findFirst({ where: { nombre: { contains: 'Karol G' } } })
    const badbunny = await prisma.titular.findFirst({ where: { nombre: { contains: 'Bad Bunny' } } })
    const jbalvin = await prisma.titular.findFirst({ where: { nombre: { contains: 'J Balvin' } } })
    const jhay = await prisma.titular.findFirst({ where: { nombre: { contains: 'Jhay Cortez' } } })
    
    console.log('📚 Obras y titulares encontrados, creando relaciones...')
    
    // Crear relaciones TitularObra
    if (bzrp52 && bizarrap && quevedo) {
      await prisma.titularObra.createMany({
        data: [
          { obra_id: bzrp52.id, titular_id: bizarrap.id, porcentaje: 50, rol: 'Compositor/Productor' },
          { obra_id: bzrp52.id, titular_id: quevedo.id, porcentaje: 50, rol: 'Artista/Compositor' }
        ]
      })
      console.log('✅ Bzrp #52 → Bizarrap (50%) + Quevedo (50%)')
    }
    
    if (despecha && rosalia) {
      await prisma.titularObra.create({
        data: { obra_id: despecha.id, titular_id: rosalia.id, porcentaje: 100, rol: 'Artista/Compositora' }
      })
      console.log('✅ Despechá → Rosalía (100%)')
    }
    
    if (corazones && nicki) {
      await prisma.titularObra.create({
        data: { obra_id: corazones.id, titular_id: nicki.id, porcentaje: 100, rol: 'Artista/Compositora' }
      })
      console.log('✅ Corazones Rotos → Nicki Nicole (100%)')
    }
    
    if (nostalgia && duki) {
      await prisma.titularObra.create({
        data: { obra_id: nostalgia.id, titular_id: duki.id, porcentaje: 100, rol: 'Artista/Compositor' }
      })
      console.log('✅ Nostalgia → Duki (100%)')
    }
    
    if (arroba && tini) {
      await prisma.titularObra.create({
        data: { obra_id: arroba.id, titular_id: tini.id, porcentaje: 100, rol: 'Artista/Compositora' }
      })
      console.log('✅ Arroba → Tini (100%)')
    }
    
    if (gatubela && karol) {
      await prisma.titularObra.create({
        data: { obra_id: gatubela.id, titular_id: karol.id, porcentaje: 100, rol: 'Artista' }
      })
      console.log('✅ Gatúbela → Karol G (100%)')
    }
    
    if (cancion && badbunny && jbalvin) {
      await prisma.titularObra.createMany({
        data: [
          { obra_id: cancion.id, titular_id: badbunny.id, porcentaje: 50, rol: 'Artista/Compositor' },
          { obra_id: cancion.id, titular_id: jbalvin.id, porcentaje: 50, rol: 'Artista/Compositor' }
        ]
      })
      console.log('✅ La Canción → Bad Bunny (50%) + J Balvin (50%)')
    }
    
    if (medusa && jhay) {
      await prisma.titularObra.create({
        data: { obra_id: medusa.id, titular_id: jhay.id, porcentaje: 100, rol: 'Artista/Compositor' }
      })
      console.log('✅ Medusa → Jhay Cortez (100%)')
    }
    
    console.log('🎉 Todas las relaciones creadas exitosamente!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

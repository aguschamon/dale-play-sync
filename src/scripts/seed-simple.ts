import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('✅ Conexión exitosa a la base de datos')
  const clientCount = await prisma.cliente.count()
  console.log(`📊 Clientes en la base: ${clientCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


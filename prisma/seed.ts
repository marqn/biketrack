import { PrismaClient } from '../lib/generated/prisma'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding BikeProducts...')

  // Opcjonalnie: usuń stare dane
  await prisma.bikeProduct.deleteMany()

  // Seed danych
  await prisma.bikeProduct.createMany({
    data: [
      {
        id: uuidv4(),
        bikeType: 'GRAVEL',
        brand: 'Cannondale',
        model: 'Topstone Carbon LTD Di2',
        year: 2024,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        bikeType: 'GRAVEL',
        brand: 'Cannondale',
        model: 'Topstone Carbon 1',
        year: 2024,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        bikeType: 'ROAD',
        brand: 'Trek',
        model: 'Domane SL 7',
        year: 2024,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        bikeType: 'ROAD',
        brand: 'Specialized',
        model: 'Tarmac SL8',
        year: 2024,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  })

  console.log('BikeProducts seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

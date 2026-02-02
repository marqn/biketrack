import { PrismaClient, PartType } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Usuń stare dane (w odpowiedniej kolejności ze względu na relacje)
  await prisma.bikeProductDefaultPart.deleteMany()
  await prisma.partProduct.deleteMany()
  await prisma.bikeProduct.deleteMany()

  // === SEED PART PRODUCTS ===
  console.log('Creating PartProducts...')

  const chainShimano105 = await prisma.partProduct.create({
    data: {
      type: PartType.CHAIN,
      brand: 'Shimano',
      model: 'CN-HG601-11',
      description: 'Lancuch 11-rzedowy Shimano 105'
    }
  })

  const chainShimanoUltegra = await prisma.partProduct.create({
    data: {
      type: PartType.CHAIN,
      brand: 'Shimano',
      model: 'CN-HG701-11',
      description: 'Lancuch 11-rzedowy Shimano Ultegra'
    }
  })

  const chainSram = await prisma.partProduct.create({
    data: {
      type: PartType.CHAIN,
      brand: 'SRAM',
      model: 'PC-1130',
      description: 'Lancuch 11-rzedowy SRAM'
    }
  })

  const cassetteShimano105 = await prisma.partProduct.create({
    data: {
      type: PartType.CASSETTE,
      brand: 'Shimano',
      model: 'CS-R7000 11-32T',
      description: 'Kaseta Shimano 105 11-32T'
    }
  })

  const cassetteShimanoGRX = await prisma.partProduct.create({
    data: {
      type: PartType.CASSETTE,
      brand: 'Shimano',
      model: 'CS-HG800-11 11-34T',
      description: 'Kaseta Shimano GRX 11-34T'
    }
  })

  const tireContinentalGP5000 = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'Continental',
      model: 'Grand Prix 5000 28mm',
      description: 'Opona szosowa Continental GP5000'
    }
  })

  const tireWTBByway = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'WTB',
      model: 'Byway 40mm',
      description: 'Opona gravelowa WTB Byway'
    }
  })

  const padsShimano105 = await prisma.partProduct.create({
    data: {
      type: PartType.PADS_FRONT,
      brand: 'Shimano',
      model: 'L03A Resin',
      description: 'Klocki hamulcowe Shimano L03A'
    }
  })

  const handlebarTapeSupacaz = await prisma.partProduct.create({
    data: {
      type: PartType.HANDLEBAR_TAPE,
      brand: 'Supacaz',
      model: 'Super Sticky Kush',
      description: 'Owijka kierownicy Supacaz'
    }
  })

  const chainringShimanoGRX = await prisma.partProduct.create({
    data: {
      type: PartType.CHAINRING_1X,
      brand: 'Shimano',
      model: 'FC-RX820 40T',
      description: 'Zebatka Shimano GRX 40T'
    }
  })

  const sealantStans = await prisma.partProduct.create({
    data: {
      type: PartType.TUBELESS_SEALANT,
      brand: 'Stans NoTubes',
      model: 'Race Sealant',
      description: 'Mleczko tubeless Stans'
    }
  })

  // === SEED BIKE PRODUCTS ===
  console.log('Creating BikeProducts...')

  const topstoneCarbon1 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Cannondale',
      model: 'Topstone Carbon 1',
      year: 2024
    }
  })

  const topstoneCarbonLTD = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Cannondale',
      model: 'Topstone Carbon LTD Di2',
      year: 2024
    }
  })

  const domaneSL7 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'ROAD',
      brand: 'Trek',
      model: 'Domane SL 7',
      year: 2024
    }
  })

  const tarmacSL8 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'ROAD',
      brand: 'Specialized',
      model: 'Tarmac SL8',
      year: 2024
    }
  })

  // === SEED DEFAULT PARTS FOR BIKES ===
  console.log('Creating BikeProductDefaultParts...')

  // Cannondale Topstone Carbon 1 - pelna specyfikacja
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: topstoneCarbon1.id, partProductId: chainShimanoUltegra.id, partType: PartType.CHAIN, expectedKm: 2000 },
      { bikeProductId: topstoneCarbon1.id, partProductId: cassetteShimanoGRX.id, partType: PartType.CASSETTE, expectedKm: 6000 },
      { bikeProductId: topstoneCarbon1.id, partProductId: tireWTBByway.id, partType: PartType.TIRE_FRONT, expectedKm: 3500 },
      { bikeProductId: topstoneCarbon1.id, partProductId: tireWTBByway.id, partType: PartType.TIRE_REAR, expectedKm: 3500 },
      { bikeProductId: topstoneCarbon1.id, partProductId: padsShimano105.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: topstoneCarbon1.id, partProductId: padsShimano105.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: topstoneCarbon1.id, partProductId: chainringShimanoGRX.id, partType: PartType.CHAINRING_1X, expectedKm: 10000 },
      { bikeProductId: topstoneCarbon1.id, partProductId: sealantStans.id, partType: PartType.TUBELESS_SEALANT, expectedKm: 3000 },
    ]
  })

  // Trek Domane SL 7 - pelna specyfikacja
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: domaneSL7.id, partProductId: chainShimano105.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: domaneSL7.id, partProductId: cassetteShimano105.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: domaneSL7.id, partProductId: tireContinentalGP5000.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: domaneSL7.id, partProductId: tireContinentalGP5000.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
      { bikeProductId: domaneSL7.id, partProductId: padsShimano105.id, partType: PartType.PADS_FRONT, expectedKm: 3000 },
      { bikeProductId: domaneSL7.id, partProductId: padsShimano105.id, partType: PartType.PADS_REAR, expectedKm: 3000 },
      { bikeProductId: domaneSL7.id, partProductId: handlebarTapeSupacaz.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 6000 },
    ]
  })

  // Specialized Tarmac SL8 - czesciowa specyfikacja (reszta z DEFAULT_PARTS)
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: tarmacSL8.id, partProductId: chainSram.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: tarmacSL8.id, partProductId: tireContinentalGP5000.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: tarmacSL8.id, partProductId: tireContinentalGP5000.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
    ]
  })

  // Cannondale Topstone Carbon LTD Di2 - bez skonfigurowanych czesci (uzyje DEFAULT_PARTS)

  console.log('Seeding completed!')
  console.log(`Created ${await prisma.partProduct.count()} PartProducts`)
  console.log(`Created ${await prisma.bikeProduct.count()} BikeProducts`)
  console.log(`Created ${await prisma.bikeProductDefaultPart.count()} BikeProductDefaultParts`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

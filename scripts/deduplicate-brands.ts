/**
 * Skrypt deduplikacji marek w bazie danych.
 *
 * Zamienia wszystkie marki na UPPER CASE i scala duplikaty
 * w tabelach z unikalnymi constraintami (PartProduct, BikeProduct).
 *
 * Uruchomienie: npx tsx scripts/deduplicate-brands.ts
 */

import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Deduplikacja marek w bazie danych ===\n')

  // 1. Proste tabele (bez unique constraint na brand) - po prostu UPDATE
  console.log('--- 1. Tabela Bike ---')
  const bikeResult = await prisma.$executeRaw`
    UPDATE "Bike" SET brand = UPPER(brand) WHERE brand IS NOT NULL AND brand != UPPER(brand)
  `
  console.log(`  Zaktualizowano ${bikeResult} rekordów\n`)

  console.log('--- 2. Tabela PartReplacement ---')
  const replacementResult = await prisma.$executeRaw`
    UPDATE "PartReplacement" SET brand = UPPER(brand) WHERE brand IS NOT NULL AND brand != UPPER(brand)
  `
  console.log(`  Zaktualizowano ${replacementResult} rekordów\n`)

  console.log('--- 3. Tabela ServiceEvent (lubricantBrand) ---')
  const serviceResult = await prisma.$executeRaw`
    UPDATE "ServiceEvent" SET "lubricantBrand" = UPPER("lubricantBrand") WHERE "lubricantBrand" IS NOT NULL AND "lubricantBrand" != UPPER("lubricantBrand")
  `
  console.log(`  Zaktualizowano ${serviceResult} rekordów\n`)

  // 2. PartProduct - ma @@unique([type, brand, model])
  // Musimy znaleźć duplikaty i scalić je przed zmianą na UPPER
  console.log('--- 4. Tabela PartProduct (z unique constraint) ---')
  await deduplicatePartProducts()

  // 3. BikeProduct - ma @@unique([bikeType, brand, model])
  console.log('--- 5. Tabela BikeProduct (z unique constraint) ---')
  await deduplicateBikeProducts()

  console.log('\n=== Deduplikacja zakończona! ===')
}

async function deduplicatePartProducts() {
  // Znajdź grupy duplikatów (różna wielkość liter, ale ten sam type+UPPER(brand)+model)
  const duplicateGroups = await prisma.$queryRaw<Array<{
    type: string
    upper_brand: string
    model: string
    cnt: bigint
  }>>`
    SELECT type, UPPER(brand) as upper_brand, model, COUNT(*) as cnt
    FROM "PartProduct"
    GROUP BY type, UPPER(brand), model
    HAVING COUNT(*) > 1
  `

  if (duplicateGroups.length === 0) {
    console.log('  Brak duplikatów do scalenia')
  }

  for (const group of duplicateGroups) {
    console.log(`  Scalanie duplikatów: type=${group.type}, brand="${group.upper_brand}", model="${group.model}"`)

    // Pobierz wszystkie rekordy z tej grupy
    const products = await prisma.partProduct.findMany({
      where: {
        type: group.type as any,
        model: group.model,
        brand: {
          in: [group.upper_brand, group.upper_brand.toLowerCase(),
               group.upper_brand.charAt(0).toUpperCase() + group.upper_brand.slice(1).toLowerCase()]
        }
      },
      include: {
        _count: {
          select: {
            bikeParts: true,
            reviews: true,
            serviceEvents: true,
            partReplacements: true,
            bikeProductDefaults: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Alternatywnie - pobierz po UPPER(brand) żeby złapać wszystkie warianty
    const allProducts = await prisma.$queryRaw<Array<{ id: string, brand: string }>>`
      SELECT id, brand FROM "PartProduct"
      WHERE type = ${group.type}::"PartType" AND UPPER(brand) = ${group.upper_brand} AND model = ${group.model}
    `

    if (allProducts.length < 2) continue

    // Zachowaj pierwszy (najstarszy) rekord jako "master"
    const masterId = allProducts[0].id
    const duplicateIds = allProducts.slice(1).map(p => p.id)

    console.log(`    Master: ${masterId} (${allProducts[0].brand}), duplikaty: ${duplicateIds.join(', ')}`)

    // Przenieś relacje z duplikatów na master
    for (const dupId of duplicateIds) {
      // BikePart - productId
      await prisma.$executeRaw`
        UPDATE "BikePart" SET "productId" = ${masterId} WHERE "productId" = ${dupId}
      `
      // PartReview - productId
      await prisma.$executeRaw`
        UPDATE "PartReview" SET "productId" = ${masterId} WHERE "productId" = ${dupId}
      `
      // ServiceEvent - lubricantProductId
      await prisma.$executeRaw`
        UPDATE "ServiceEvent" SET "lubricantProductId" = ${masterId} WHERE "lubricantProductId" = ${dupId}
      `
      // PartReplacement - productId
      await prisma.$executeRaw`
        UPDATE "PartReplacement" SET "productId" = ${masterId} WHERE "productId" = ${dupId}
      `
      // BikeProductDefaultPart - partProductId
      await prisma.$executeRaw`
        UPDATE "BikeProductDefaultPart" SET "partProductId" = ${masterId} WHERE "partProductId" = ${dupId}
      `
    }

    // Usuń duplikaty
    await prisma.partProduct.deleteMany({
      where: { id: { in: duplicateIds } }
    })
    console.log(`    Usunięto ${duplicateIds.length} duplikat(ów)`)
  }

  // Teraz zamień wszystkie brandy na UPPER
  const result = await prisma.$executeRaw`
    UPDATE "PartProduct" SET brand = UPPER(brand) WHERE brand != UPPER(brand)
  `
  console.log(`  Zaktualizowano ${result} rekordów na UPPER CASE\n`)
}

async function deduplicateBikeProducts() {
  // Znajdź grupy duplikatów
  const duplicateGroups = await prisma.$queryRaw<Array<{
    bikeType: string
    upper_brand: string
    model: string
    cnt: bigint
  }>>`
    SELECT "bikeType", UPPER(brand) as upper_brand, model, COUNT(*) as cnt
    FROM "BikeProduct"
    GROUP BY "bikeType", UPPER(brand), model
    HAVING COUNT(*) > 1
  `

  if (duplicateGroups.length === 0) {
    console.log('  Brak duplikatów do scalenia')
  }

  for (const group of duplicateGroups) {
    console.log(`  Scalanie duplikatów: bikeType=${group.bikeType}, brand="${group.upper_brand}", model="${group.model}"`)

    const allProducts = await prisma.$queryRaw<Array<{ id: string, brand: string }>>`
      SELECT id, brand FROM "BikeProduct"
      WHERE "bikeType" = ${group.bikeType}::"BikeType" AND UPPER(brand) = ${group.upper_brand} AND model = ${group.model}
    `

    if (allProducts.length < 2) continue

    const masterId = allProducts[0].id
    const duplicateIds = allProducts.slice(1).map(p => p.id)

    console.log(`    Master: ${masterId} (${allProducts[0].brand}), duplikaty: ${duplicateIds.join(', ')}`)

    // Przenieś relacje z duplikatów na master
    for (const dupId of duplicateIds) {
      // BikeProductDefaultPart - bikeProductId
      // Ale tu jest @@unique([bikeProductId, partType]), więc musimy uważać
      // Usuń duplikat default parts jeśli master już ma taki partType
      const existingDefaults = await prisma.bikeProductDefaultPart.findMany({
        where: { bikeProductId: masterId },
        select: { partType: true }
      })
      const existingPartTypes = new Set(existingDefaults.map(d => d.partType))

      // Usuń conflicting defaults z duplikatu
      await prisma.$executeRaw`
        DELETE FROM "BikeProductDefaultPart"
        WHERE "bikeProductId" = ${dupId}
        AND "partType" IN (SELECT "partType" FROM "BikeProductDefaultPart" WHERE "bikeProductId" = ${masterId})
      `
      // Przenieś resztę
      await prisma.$executeRaw`
        UPDATE "BikeProductDefaultPart" SET "bikeProductId" = ${masterId} WHERE "bikeProductId" = ${dupId}
      `
    }

    // Usuń duplikaty
    await prisma.bikeProduct.deleteMany({
      where: { id: { in: duplicateIds } }
    })
    console.log(`    Usunięto ${duplicateIds.length} duplikat(ów)`)
  }

  // Zamień wszystkie brandy na UPPER
  const result = await prisma.$executeRaw`
    UPDATE "BikeProduct" SET brand = UPPER(brand) WHERE brand != UPPER(brand)
  `
  console.log(`  Zaktualizowano ${result} rekordów na UPPER CASE\n`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

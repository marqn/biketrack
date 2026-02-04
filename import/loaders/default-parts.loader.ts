import { PrismaClient, PartType, BikeType } from '../../lib/generated/prisma'
import { RawBikeData, RawComponent } from '../schemas'
import { normalizeBrand } from '../transformers/brand.normalizer'
import { mapToPartType } from '../transformers/part-type.mapper'
import { mapToBikeTypeOrDefault } from '../transformers/bike-type.mapper'
import { getExpectedKm } from '../config/expected-km.config'

const prisma = new PrismaClient()

export interface DefaultPartsLoadResult {
  created: number
  skipped: number
  errors: Array<{ component: RawComponent; error: string }>
}

export interface DefaultPartsLoaderOptions {
  dryRun?: boolean
  verbose?: boolean
}

/**
 * Parsuje komponent roweru i wyodrębnia markę i model części
 * np. "Shimano GRX RD-RX820" -> { brand: "Shimano", model: "GRX RD-RX820" }
 */
function parseComponentValue(value: string): { brand: string; model: string } | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  // Znane prefiksy marek
  const knownBrands = [
    'Shimano', 'SRAM', 'Campagnolo', 'Continental', 'Schwalbe', 'WTB',
    'Fizik', 'Selle', 'DT Swiss', 'FSA', 'RockShox', 'Fox', 'Magura',
    'Hope', 'Chris King', 'Supacaz', 'Kross', 'Vision', 'Zipp', 'X-Fusion',
    "Stan's", 'Stans', 'Maxxis', 'Vittoria', 'Pirelli', 'Hutchinson',
  ]

  for (const brand of knownBrands) {
    if (trimmed.toLowerCase().startsWith(brand.toLowerCase())) {
      const model = trimmed.slice(brand.length).trim()
      return { brand, model: model || trimmed }
    }
  }

  // Spróbuj wyodrębnić pierwsze słowo jako markę
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return { brand: parts[0], model: parts.slice(1).join(' ') }
  }

  return { brand: trimmed, model: trimmed }
}

/**
 * Ładuje domyślne części dla roweru na podstawie komponentów z JSON
 */
export async function loadDefaultPartsForBike(
  bikeId: string,
  components: RawComponent[],
  bikeType: BikeType,
  options: DefaultPartsLoaderOptions = {}
): Promise<DefaultPartsLoadResult> {
  const { dryRun = false, verbose = false } = options

  const result: DefaultPartsLoadResult = {
    created: 0,
    skipped: 0,
    errors: [],
  }

  for (const component of components) {
    try {
      // Mapuj typ części
      const partType = mapToPartType(component.name) || mapToPartType(component.category)
      if (!partType) {
        result.errors.push({
          component,
          error: `Nieznany typ części: "${component.name}" / "${component.category}"`
        })
        continue
      }

      // Parsuj wartość komponentu
      const parsed = parseComponentValue(component.value)
      if (!parsed) {
        result.errors.push({ component, error: 'Nie można sparsować wartości komponentu' })
        continue
      }

      const brand = normalizeBrand(parsed.brand)
      const model = parsed.model

      // Znajdź lub utwórz PartProduct
      let partProduct = await prisma.partProduct.findFirst({
        where: {
          type: partType,
          brand: { equals: brand, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },
        },
      })

      if (!partProduct && !dryRun) {
        // Utwórz nowy PartProduct
        partProduct = await prisma.partProduct.create({
          data: {
            type: partType,
            brand,
            model,
            description: component.value,
          },
        })
        if (verbose) console.log(`    [NEW PART] ${brand} ${model}`)
      }

      if (!partProduct) {
        if (verbose) console.log(`    [DRY-RUN] Would create part: ${brand} ${model}`)
        result.created++
        continue
      }

      // Sprawdź czy relacja już istnieje
      const existingRelation = await prisma.bikeProductDefaultPart.findFirst({
        where: {
          bikeProductId: bikeId,
          partType,
        },
      })

      if (existingRelation) {
        if (verbose) console.log(`    [SKIP] ${partType} już istnieje dla tego roweru`)
        result.skipped++
        continue
      }

      // Oblicz expectedKm
      const expectedKm = component.expectedKm ?? getExpectedKm(partType, bikeType)

      // Utwórz relację
      if (!dryRun) {
        await prisma.bikeProductDefaultPart.create({
          data: {
            bikeProductId: bikeId,
            partProductId: partProduct.id,
            partType,
            expectedKm,
          },
        })
      }
      if (verbose) console.log(`    [CREATE] ${partType}: ${brand} ${model} (${expectedKm} km)`)
      result.created++

    } catch (error) {
      result.errors.push({
        component,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return result
}

/**
 * Ładuje domyślne części dla roweru z RawBikeData
 * Wymaga, aby rower już istniał w bazie
 */
export async function loadDefaultPartsFromBikeData(
  raw: RawBikeData,
  options: DefaultPartsLoaderOptions = {}
): Promise<DefaultPartsLoadResult & { bikeFound: boolean }> {
  const { verbose = false } = options

  // Znajdź rower w bazie
  const brand = normalizeBrand(raw.brand)
  const model = raw.model.trim()
  const bikeType = mapToBikeTypeOrDefault(raw.rawType)

  const bike = await prisma.bikeProduct.findFirst({
    where: {
      bikeType,
      brand: { equals: brand, mode: 'insensitive' },
      model: { equals: model, mode: 'insensitive' },
      year: raw.year || undefined,
    },
  })

  if (!bike) {
    if (verbose) console.log(`  [ERROR] Nie znaleziono roweru: ${brand} ${model}`)
    return {
      bikeFound: false,
      created: 0,
      skipped: 0,
      errors: [],
    }
  }

  if (verbose) console.log(`  Loading default parts for: ${brand} ${model}`)

  const result = await loadDefaultPartsForBike(bike.id, raw.components, bikeType, options)
  return { ...result, bikeFound: true }
}

/**
 * Zamyka połączenie z bazą
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect()
}

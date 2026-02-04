import { PrismaClient, BikeType, Prisma } from '../../lib/generated/prisma'
import { RawBikeData, RawBikesFileSchema } from '../schemas'
import { normalizeBrand } from '../transformers/brand.normalizer'
import { mapToBikeTypeOrDefault } from '../transformers/bike-type.mapper'

const prisma = new PrismaClient()

// Helper do konwersji specifications na typ Prisma JSON
function toJsonValue(obj: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
  if (!obj) return undefined
  return obj as Prisma.InputJsonValue
}

export interface BikeLoadResult {
  created: number
  updated: number
  skipped: number
  errors: Array<{ data: RawBikeData; error: string }>
}

export interface BikeLoaderOptions {
  dryRun?: boolean
  verbose?: boolean
  upsert?: boolean
}

/**
 * Ładuje pojedynczy rower do bazy
 */
export async function loadBike(
  raw: RawBikeData,
  options: BikeLoaderOptions = {}
): Promise<{ status: 'created' | 'updated' | 'skipped' | 'error'; id?: string; error?: string }> {
  const { dryRun = false, verbose = false, upsert = true } = options

  try {
    // Normalizacja
    const brand = normalizeBrand(raw.brand)
    const model = raw.model.trim()
    const bikeType = mapToBikeTypeOrDefault(raw.rawType)

    // Sprawdź czy istnieje
    const existing = await prisma.bikeProduct.findFirst({
      where: {
        bikeType,
        brand: { equals: brand, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
        year: raw.year || undefined,
      },
    })

    if (existing) {
      if (!upsert) {
        if (verbose) console.log(`  [SKIP] ${brand} ${model} ${raw.year || ''} (już istnieje)`)
        return { status: 'skipped', id: existing.id }
      }

      // Update
      if (!dryRun) {
        await prisma.bikeProduct.update({
          where: { id: existing.id },
          data: {
            description: raw.description || existing.description,
            specifications: toJsonValue(raw.specifications) ?? existing.specifications,
            officialImageUrl: raw.imageUrl || existing.officialImageUrl,
          },
        })
      }
      if (verbose) console.log(`  [UPDATE] ${brand} ${model} ${raw.year || ''}`)
      return { status: 'updated', id: existing.id }
    }

    // Create
    let newId: string | undefined
    if (!dryRun) {
      const created = await prisma.bikeProduct.create({
        data: {
          bikeType,
          brand,
          model,
          year: raw.year,
          description: raw.description,
          specifications: toJsonValue(raw.specifications),
          officialImageUrl: raw.imageUrl,
        },
      })
      newId = created.id
    }
    if (verbose) console.log(`  [CREATE] ${brand} ${model} ${raw.year || ''}`)
    return { status: 'created', id: newId }

  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Ładuje wiele rowerów z tablicy
 */
export async function loadBikes(
  bikes: RawBikeData[],
  options: BikeLoaderOptions = {}
): Promise<BikeLoadResult> {
  const result: BikeLoadResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  for (const bike of bikes) {
    const loadResult = await loadBike(bike, options)

    switch (loadResult.status) {
      case 'created':
        result.created++
        break
      case 'updated':
        result.updated++
        break
      case 'skipped':
        result.skipped++
        break
      case 'error':
        result.errors.push({ data: bike, error: loadResult.error || 'Nieznany błąd' })
        break
    }
  }

  return result
}

/**
 * Ładuje rowery z pliku JSON (waliduje schema)
 */
export async function loadBikesFromJson(
  jsonContent: string,
  options: BikeLoaderOptions = {}
): Promise<BikeLoadResult> {
  // Parsuj JSON
  let data: unknown
  try {
    data = JSON.parse(jsonContent)
  } catch {
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [{ data: {} as RawBikeData, error: 'Nieprawidłowy JSON' }],
    }
  }

  // Waliduj schema
  const parsed = RawBikesFileSchema.safeParse(data)
  if (!parsed.success) {
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [{ data: {} as RawBikeData, error: `Błąd walidacji: ${parsed.error.message}` }],
    }
  }

  return loadBikes(parsed.data.bikes, options)
}

/**
 * Zamyka połączenie z bazą
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect()
}

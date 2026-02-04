import { PrismaClient, PartType, Prisma } from '../../lib/generated/prisma'
import { RawPartData, RawPartsFileSchema } from '../schemas'
import { normalizeBrand } from '../transformers/brand.normalizer'
import { mapToPartType } from '../transformers/part-type.mapper'

const prisma = new PrismaClient()

// Helper do konwersji specifications na typ Prisma JSON
function toJsonValue(obj: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
  if (!obj) return undefined
  return obj as Prisma.InputJsonValue
}

export interface PartLoadResult {
  created: number
  updated: number
  skipped: number
  errors: Array<{ data: RawPartData; error: string }>
}

export interface PartLoaderOptions {
  dryRun?: boolean
  verbose?: boolean
  upsert?: boolean  // true = update jeśli istnieje, false = skip
}

/**
 * Ładuje pojedynczą część do bazy
 */
export async function loadPart(
  raw: RawPartData,
  options: PartLoaderOptions = {}
): Promise<{ status: 'created' | 'updated' | 'skipped' | 'error'; error?: string }> {
  const { dryRun = false, verbose = false, upsert = true } = options

  try {
    // Normalizacja
    const brand = normalizeBrand(raw.brand)
    const model = raw.model.trim()

    // Mapowanie typu
    const partType = mapToPartType(raw.rawType)
    if (!partType) {
      return {
        status: 'error',
        error: `Nieznany typ części: "${raw.rawType}"`
      }
    }

    // Sprawdź czy istnieje
    const existing = await prisma.partProduct.findFirst({
      where: {
        type: partType,
        brand: { equals: brand, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
      },
    })

    if (existing) {
      if (!upsert) {
        if (verbose) console.log(`  [SKIP] ${brand} ${model} (już istnieje)`)
        return { status: 'skipped' }
      }

      // Update
      if (!dryRun) {
        await prisma.partProduct.update({
          where: { id: existing.id },
          data: {
            description: raw.description || existing.description,
            specifications: toJsonValue(raw.specifications) ?? existing.specifications,
            officialImageUrl: raw.imageUrl || existing.officialImageUrl,
            officialPrice: raw.price?.value ?? existing.officialPrice,
          },
        })
      }
      if (verbose) console.log(`  [UPDATE] ${brand} ${model}`)
      return { status: 'updated' }
    }

    // Create
    if (!dryRun) {
      await prisma.partProduct.create({
        data: {
          type: partType,
          brand,
          model,
          description: raw.description,
          specifications: toJsonValue(raw.specifications),
          officialImageUrl: raw.imageUrl,
          officialPrice: raw.price?.value,
        },
      })
    }
    if (verbose) console.log(`  [CREATE] ${brand} ${model}`)
    return { status: 'created' }

  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Ładuje wiele części z tablicy
 */
export async function loadParts(
  parts: RawPartData[],
  options: PartLoaderOptions = {}
): Promise<PartLoadResult> {
  const result: PartLoadResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  for (const part of parts) {
    const loadResult = await loadPart(part, options)

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
        result.errors.push({ data: part, error: loadResult.error || 'Nieznany błąd' })
        break
    }
  }

  return result
}

/**
 * Ładuje części z pliku JSON (waliduje schema)
 */
export async function loadPartsFromJson(
  jsonContent: string,
  options: PartLoaderOptions = {}
): Promise<PartLoadResult> {
  // Parsuj JSON
  let data: unknown
  try {
    data = JSON.parse(jsonContent)
  } catch {
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [{ data: {} as RawPartData, error: 'Nieprawidłowy JSON' }],
    }
  }

  // Waliduj schema
  const parsed = RawPartsFileSchema.safeParse(data)
  if (!parsed.success) {
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [{ data: {} as RawPartData, error: `Błąd walidacji: ${parsed.error.message}` }],
    }
  }

  return loadParts(parsed.data.parts, options)
}

/**
 * Zamyka połączenie z bazą
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect()
}

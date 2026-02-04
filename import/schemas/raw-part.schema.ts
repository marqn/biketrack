import { z } from 'zod'

// Schema dla źródła danych
export const PartSourceSchema = z.object({
  name: z.string(),          // np. "shimano.com", "bike-discount.de"
  url: z.string().url().optional(),
})

// Schema dla kompatybilności
export const CompatibilitySchema = z.object({
  speeds: z.number().int().optional(),           // np. 11, 12
  bikeTypes: z.array(z.string()).default([]),    // np. ["gravel", "road"]
  brands: z.array(z.string()).default([]),       // kompatybilne marki
}).optional()

// Główna schema dla części
export const RawPartDataSchema = z.object({
  // Źródło
  source: PartSourceSchema,

  // Identyfikacja
  brand: z.string().min(1),
  model: z.string().min(1),

  // Typ części (surowy - do zmapowania na PartType enum)
  rawType: z.string(),       // np. "łańcuch", "chain", "kaseta", "cassette"
  rawCategory: z.string().optional(), // np. "Napęd", "Drivetrain"

  // Opis
  description: z.string().optional(),

  // Kompatybilność
  compatibility: CompatibilitySchema,

  // Specyfikacje techniczne
  specifications: z.record(z.string(), z.unknown()).optional(),

  // Cena (opcjonalna)
  price: z.object({
    value: z.number().positive().optional(),
    currency: z.string().default('PLN'),
  }).optional(),

  // URL do obrazu
  imageUrl: z.string().url().optional(),
})

export type RawPartData = z.infer<typeof RawPartDataSchema>

// Schema dla tablicy części
export const RawPartsFileSchema = z.object({
  parts: z.array(RawPartDataSchema),
  metadata: z.object({
    exportedAt: z.string().datetime().optional(),
    source: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
})

export type RawPartsFile = z.infer<typeof RawPartsFileSchema>

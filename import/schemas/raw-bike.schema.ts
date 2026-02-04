import { z } from 'zod'

// Schema dla pojedynczego komponentu roweru
export const RawComponentSchema = z.object({
  category: z.string(),      // np. "Napęd", "Drive train", "Hamulce"
  name: z.string(),          // np. "Łańcuch", "Przerzutka tylna"
  value: z.string(),         // np. "Shimano CN-M6100", "SRAM Rival XPLR AXS"
  expectedKm: z.number().optional(), // opcjonalnie podany expectedKm
})

export type RawComponent = z.infer<typeof RawComponentSchema>

// Schema dla źródła danych
export const SourceSchema = z.object({
  name: z.string(),          // np. "99spokes", "bikester.pl", "canyon.com"
  url: z.string().url().optional(),
  scrapedAt: z.string().datetime().optional(),
})

// Główna schema dla roweru
export const RawBikeDataSchema = z.object({
  // Źródło danych
  source: SourceSchema,

  // Podstawowe dane roweru
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(2030).optional(),

  // Typ roweru (surowy - do zmapowania na BikeType enum)
  rawType: z.string(),       // np. "gravel", "szosa", "mtb", "road", "mountain"

  // Czy elektryczny
  isElectric: z.boolean().optional().default(false),

  // Specyfikacja komponentów
  components: z.array(RawComponentSchema).default([]),

  // Dodatkowe specyfikacje (opcjonalne)
  specifications: z.record(z.string(), z.unknown()).optional(),

  // Opis
  description: z.string().optional(),

  // URL do oficjalnego obrazu
  imageUrl: z.string().url().optional(),
})

export type RawBikeData = z.infer<typeof RawBikeDataSchema>

// Schema dla tablicy rowerów (plik JSON może zawierać wiele rowerów)
export const RawBikesFileSchema = z.object({
  bikes: z.array(RawBikeDataSchema),
  metadata: z.object({
    exportedAt: z.string().datetime().optional(),
    source: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
})

export type RawBikesFile = z.infer<typeof RawBikesFileSchema>

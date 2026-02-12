import { BikeType } from '../../lib/generated/prisma'

/**
 * Mapowanie wielojęzyczne nazw typów rowerów na BikeType enum
 */

const BIKE_TYPE_MAPPINGS: Record<string, BikeType> = {
  // === ROAD / SZOSA ===
  'road': BikeType.ROAD,
  'road bike': BikeType.ROAD,
  'szosa': BikeType.ROAD,
  'szosowy': BikeType.ROAD,
  'rower szosowy': BikeType.ROAD,
  'rennrad': BikeType.ROAD,
  'race': BikeType.ROAD,
  'racing': BikeType.ROAD,
  'endurance': BikeType.ROAD,
  'aero': BikeType.ROAD,

  // === GRAVEL ===
  'gravel': BikeType.GRAVEL,
  'gravel bike': BikeType.GRAVEL,
  'gravelowy': BikeType.GRAVEL,
  'rower gravelowy': BikeType.GRAVEL,
  'gravelbike': BikeType.GRAVEL,
  'adventure': BikeType.GRAVEL,
  'all-road': BikeType.GRAVEL,
  'allroad': BikeType.GRAVEL,
  'cyclocross': BikeType.GRAVEL,
  'cx': BikeType.GRAVEL,
  'przełajowy': BikeType.GRAVEL,

  // === MTB ===
  'mtb': BikeType.MTB,
  'mountain': BikeType.MTB,
  'mountain bike': BikeType.MTB,
  'mountainbike': BikeType.MTB,
  'górski': BikeType.MTB,
  'rower górski': BikeType.MTB,
  'xc': BikeType.MTB,
  'cross country': BikeType.MTB,
  'cross-country': BikeType.MTB,
  'trail': BikeType.MTB,
  'enduro': BikeType.MTB,
  'downhill': BikeType.MTB,
  'dh': BikeType.MTB,
  'all mountain': BikeType.MTB,
  'all-mountain': BikeType.MTB,
  'hardtail': BikeType.MTB,
  'full suspension': BikeType.MTB,
  '29er': BikeType.MTB,
  '27.5': BikeType.MTB,

  // === TRAINER / TRENAŻER ===
  'trainer': BikeType.TRAINER,
  'trenażer': BikeType.TRAINER,
  'trenazer': BikeType.TRAINER,
  'smart trainer': BikeType.TRAINER,
  'direct drive': BikeType.TRAINER,
  'wheel-on': BikeType.TRAINER,
  'rolki': BikeType.TRAINER,
  'rollers': BikeType.TRAINER,
  'rower stacjonarny': BikeType.TRAINER,
  'indoor': BikeType.TRAINER,
  'stationary': BikeType.TRAINER,

  // === OTHER ===
  'other': BikeType.OTHER,
  'inne': BikeType.OTHER,
  'inny': BikeType.OTHER,
  'city': BikeType.OTHER,
  'miejski': BikeType.OTHER,
  'urban': BikeType.OTHER,
  'touring': BikeType.OTHER,
  'turystyczny': BikeType.OTHER,
  'trekking': BikeType.OTHER,
  'trekkingowy': BikeType.OTHER,
  'fitness': BikeType.OTHER,
  'hybrid': BikeType.OTHER,
  'hybrydowy': BikeType.OTHER,
  'e-bike': BikeType.OTHER,
  'ebike': BikeType.OTHER,
  'elektryczny': BikeType.OTHER,
  'cargo': BikeType.OTHER,
  'składak': BikeType.OTHER,
  'folding': BikeType.OTHER,
  'bmx': BikeType.OTHER,
  'kids': BikeType.OTHER,
  'dziecięcy': BikeType.OTHER,
}

/**
 * Mapuje surową nazwę typu roweru na BikeType enum
 * @returns BikeType lub null jeśli nie znaleziono mapowania
 */
export function mapToBikeType(rawType: string): BikeType | null {
  const normalized = rawType.toLowerCase().trim()

  // Dokładne dopasowanie
  if (BIKE_TYPE_MAPPINGS[normalized]) {
    return BIKE_TYPE_MAPPINGS[normalized]
  }

  // Częściowe dopasowanie
  for (const [pattern, bikeType] of Object.entries(BIKE_TYPE_MAPPINGS)) {
    if (normalized.includes(pattern) || pattern.includes(normalized)) {
      return bikeType
    }
  }

  return null
}

/**
 * Mapuje z domyślną wartością (OTHER)
 */
export function mapToBikeTypeOrDefault(rawType: string): BikeType {
  return mapToBikeType(rawType) ?? BikeType.OTHER
}

/**
 * Sprawdza czy typ roweru jest rozpoznawany
 */
export function isKnownBikeType(rawType: string): boolean {
  return mapToBikeType(rawType) !== null
}

/**
 * Zwraca wszystkie znane nazwy dla danego BikeType
 */
export function getAliasesForBikeType(bikeType: BikeType): string[] {
  return Object.entries(BIKE_TYPE_MAPPINGS)
    .filter(([_, type]) => type === bikeType)
    .map(([alias, _]) => alias)
}

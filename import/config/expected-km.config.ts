import { BikeType, PartType } from '../../lib/generated/prisma'
import { DEFAULT_PARTS, EBIKE_PARTS } from '../../lib/default-parts'

/**
 * Konfiguracja expectedKm dla importowanych części
 * Wykorzystuje istniejące wartości z lib/default-parts.ts jako fallback
 */

/**
 * Domyślne wartości expectedKm per PartType (bez względu na typ roweru)
 * Używane jako ostateczny fallback
 */
export const FALLBACK_EXPECTED_KM: Record<PartType, number> = {
  // Rama i widelec
  [PartType.FRAME]: 80000,
  [PartType.FORK]: 40000,
  [PartType.SUSPENSION_FORK]: 10000,
  [PartType.HEADSET]: 25000,
  [PartType.BOTTOM_BRACKET]: 12000,

  // Napęd
  [PartType.CRANKSET]: 25000,
  [PartType.CHAIN]: 2000,
  [PartType.CASSETTE]: 6000,
  [PartType.DERAILLEUR_FRONT]: 30000,
  [PartType.DERAILLEUR_REAR]: 15000,
  [PartType.SHIFTERS]: 25000,
  [PartType.SHIFT_CABLES]: 4000,
  [PartType.PEDALS]: 25000,
  [PartType.CLEATS]: 5000,

  // Hamulce
  [PartType.PADS_FRONT]: 2500,
  [PartType.PADS_REAR]: 2500,
  [PartType.DISC_FRONT]: 12000,
  [PartType.DISC_REAR]: 12000,
  [PartType.BRAKE_CABLES]: 2500,
  [PartType.BRAKE_FLUID]: 10000,

  // Koła
  [PartType.HUBS]: 25000,
  [PartType.RIMS]: 15000,
  [PartType.SPOKES]: 25000,
  [PartType.TIRE_FRONT]: 3500,
  [PartType.TIRE_REAR]: 3500,
  [PartType.INNER_TUBE_FRONT]: 3500,
  [PartType.INNER_TUBE_REAR]: 3500,
  [PartType.TUBELESS_SEALANT]: 3000,

  // Cockpit
  [PartType.STEM]: 40000,
  [PartType.HANDLEBAR]: 25000,
  [PartType.HANDLEBAR_TAPE]: 5000,
  [PartType.GRIPS]: 5000,

  // Siodło
  [PartType.SADDLE]: 15000,
  [PartType.SEATPOST]: 40000,
  [PartType.SUSPENSION_SEATPOST]: 10000,
  [PartType.DROPPER_POST]: 8000,

  // Akcesoria
  [PartType.FENDER_FRONT]: 50000,
  [PartType.FENDER_REAR]: 50000,
  [PartType.KICKSTAND]: 100000,
  [PartType.RACK]: 80000,
  [PartType.BAG_SADDLE]: 30000,
  [PartType.BAG_FRAME]: 30000,
  [PartType.BOTTLE_CAGE]: 50000,
  [PartType.LIGHT_FRONT]: 20000,
  [PartType.LIGHT_REAR]: 20000,
  [PartType.BELL]: 100000,
  [PartType.COMPUTER]: 50000,

  // Inne
  [PartType.LUBRICANT]: 200,

  // E-bike
  [PartType.MOTOR]: 50000,
  [PartType.BATTERY]: 30000,
  [PartType.CONTROLLER]: 40000,

  // Przestarzałe
  [PartType.CHAINRING_1X]: 30000,
  [PartType.BRAKES]: 20000,
  [PartType.BRAKE_LEVERS]: 30000,
}

/**
 * Pobiera expectedKm dla danej części i typu roweru
 * Priorytet:
 * 1. Wartość z DEFAULT_PARTS dla danego typu roweru
 * 2. Wartość z EBIKE_PARTS (dla części e-bike)
 * 3. Wartość z FALLBACK_EXPECTED_KM
 */
export function getExpectedKm(partType: PartType, bikeType?: BikeType): number {
  // 1. Szukaj w DEFAULT_PARTS dla konkretnego typu roweru
  if (bikeType && DEFAULT_PARTS[bikeType]) {
    const match = DEFAULT_PARTS[bikeType].find(p => p.type === partType)
    if (match) {
      return match.expectedKm
    }
  }

  // 2. Dla części e-bike
  const ebikePart = EBIKE_PARTS.find(p => p.type === partType)
  if (ebikePart) {
    return ebikePart.expectedKm
  }

  // 3. Fallback
  return FALLBACK_EXPECTED_KM[partType] ?? 10000
}

/**
 * Pobiera wszystkie domyślne części dla typu roweru (z expectedKm)
 */
export function getDefaultPartsForBikeType(bikeType: BikeType): Array<{ type: PartType; expectedKm: number }> {
  return DEFAULT_PARTS[bikeType] || []
}

/**
 * Sprawdza czy dany PartType jest częścią e-bike
 */
export function isEbikePart(partType: PartType): boolean {
  return partType === PartType.MOTOR || partType === PartType.BATTERY || partType === PartType.CONTROLLER
}

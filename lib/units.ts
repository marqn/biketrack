export type UnitPreference = "METRIC" | "IMPERIAL"

export const KM_TO_MI = 0.621371
export const MI_TO_KM = 1.60934
export const KG_TO_LBS = 2.20462
export const LBS_TO_KG = 0.453592

// Konwersja do wyświetlania (metric z bazy → jednostki użytkownika)
export function displayKm(km: number, unit: UnitPreference): number {
  if (unit === "IMPERIAL") return Math.round(km * KM_TO_MI)
  return km
}

export function displayKg(kg: number, unit: UnitPreference): number {
  if (unit === "IMPERIAL") return Math.round(kg * KG_TO_LBS)
  return kg
}

// Konwersja z inputu użytkownika → metric do zapisu w bazie
export function inputToKm(value: number, unit: UnitPreference): number {
  if (unit === "IMPERIAL") return Math.round(value * MI_TO_KM)
  return value
}

export function inputToKg(value: number, unit: UnitPreference): number {
  if (unit === "IMPERIAL") return Math.round(value * LBS_TO_KG)
  return value
}

// Formatowanie z etykietą jednostki
export function formatDistance(km: number, unit: UnitPreference): string {
  const value = displayKm(km, unit)
  const label = distanceUnit(unit)
  return `${value.toLocaleString("pl-PL")} ${label}`
}

export function formatWeight(kg: number, unit: UnitPreference): string {
  const value = displayKg(kg, unit)
  const label = weightUnit(unit)
  return `${value} ${label}`
}

// Etykiety jednostek
export function distanceUnit(unit: UnitPreference): string {
  return unit === "IMPERIAL" ? "mi" : "km"
}

export function weightUnit(unit: UnitPreference): string {
  return unit === "IMPERIAL" ? "lbs" : "kg"
}

// Zakresy dla stepperów
export function distanceRange(unit: UnitPreference): { min: number; max: number } {
  if (unit === "IMPERIAL") return { min: 0, max: 621_371 } // ~1M km in miles
  return { min: 0, max: 1_000_000 }
}

export function weightRange(unit: UnitPreference): { min: number; max: number } {
  if (unit === "IMPERIAL") return { min: 44, max: 660 } // 20-300 kg in lbs
  return { min: 20, max: 300 }
}

// Auto-detekcja na podstawie locale przeglądarki
export function detectUnitFromLocale(locale: string): UnitPreference {
  const imperialLocales = ["en-US", "en-LR", "en-MM", "my", "lr"] // US, Liberia, Myanmar
  const upperLocale = locale.toUpperCase()
  if (upperLocale.includes("US") || upperLocale === "MY" || upperLocale === "LR") {
    return "IMPERIAL"
  }
  // UK używa mil/funtów nieoficjalnie, ale Prisma domyślna to metryczna — zostawiamy METRIC
  return "METRIC"
}

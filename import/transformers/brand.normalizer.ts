/**
 * Normalizacja nazw marek
 * Mapuje różne warianty pisowni na kanoniczne nazwy
 */

const BRAND_ALIASES: Record<string, string> = {
  // Shimano
  'shimano': 'Shimano',
  'shim': 'Shimano',
  'sm': 'Shimano',

  // SRAM
  'sram': 'SRAM',
  'sram/zipp': 'SRAM',
  'zipp': 'SRAM Zipp',

  // Continental
  'continental': 'Continental',
  'conti': 'Continental',

  // Schwalbe
  'schwalbe': 'Schwalbe',

  // DT Swiss
  'dt swiss': 'DT Swiss',
  'dtswiss': 'DT Swiss',
  'dt-swiss': 'DT Swiss',

  // WTB
  'wtb': 'WTB',
  'wilderness trail bikes': 'WTB',

  // Fizik
  'fizik': 'Fizik',
  "fi'zi:k": 'Fizik',

  // Kross
  'kross': 'Kross',

  // Canyon
  'canyon': 'Canyon',

  // Giant
  'giant': 'Giant',

  // Trek
  'trek': 'Trek',

  // Specialized
  'specialized': 'Specialized',
  'spesh': 'Specialized',
  's-works': 'Specialized',

  // Cannondale
  'cannondale': 'Cannondale',

  // RockShox
  'rockshox': 'RockShox',
  'rock shox': 'RockShox',

  // Fox
  'fox': 'Fox',
  'fox racing shox': 'Fox',

  // Magura
  'magura': 'Magura',

  // Hope
  'hope': 'Hope',

  // Chris King
  'chris king': 'Chris King',
  'chrisking': 'Chris King',

  // FSA
  'fsa': 'FSA',
  'full speed ahead': 'FSA',

  // Supacaz
  'supacaz': 'Supacaz',

  // Selle Royal
  'selle royal': 'Selle Royal',
  'selleroyal': 'Selle Royal',

  // Stan's NoTubes
  'stans': "Stan's NoTubes",
  "stan's": "Stan's NoTubes",
  'stans notubes': "Stan's NoTubes",
  "stan's notubes": "Stan's NoTubes",

  // Campagnolo
  'campagnolo': 'Campagnolo',
  'campy': 'Campagnolo',

  // Rose
  'rose': 'Rose',
  'rose bikes': 'Rose',

  // Merida
  'merida': 'Merida',

  // Scott
  'scott': 'Scott',

  // BMC
  'bmc': 'BMC',

  // Pinarello
  'pinarello': 'Pinarello',

  // Cervelo
  'cervelo': 'Cervélo',
  'cervélo': 'Cervélo',

  // X-Fusion
  'x-fusion': 'X-Fusion',
  'xfusion': 'X-Fusion',

  // Vision
  'vision': 'Vision',
}

/**
 * Capitalize first letter of each word
 */
function capitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Normalizuje nazwę marki do kanonicznej formy
 */
export function normalizeBrand(rawBrand: string): string {
  const trimmed = rawBrand.trim()
  const normalized = trimmed.toLowerCase()

  // Sprawdź aliasy
  if (BRAND_ALIASES[normalized]) {
    return BRAND_ALIASES[normalized]
  }

  // Jeśli nie znaleziono, zwróć z pierwszą wielką literą
  return capitalizeWords(trimmed)
}

/**
 * Sprawdza czy marka jest znana (ma alias)
 */
export function isKnownBrand(rawBrand: string): boolean {
  const normalized = rawBrand.trim().toLowerCase()
  return normalized in BRAND_ALIASES
}

/**
 * Zwraca listę wszystkich znanych marek
 */
export function getKnownBrands(): string[] {
  return Array.from(new Set(Object.values(BRAND_ALIASES)))
}

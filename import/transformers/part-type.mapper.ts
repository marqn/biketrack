import { PartType } from '../../lib/generated/prisma'

/**
 * Mapowanie wielojęzyczne nazw części na PartType enum
 * Obsługuje: polski, angielski, niemiecki
 */

const PART_TYPE_MAPPINGS: Record<string, PartType> = {
  // === RAMA ===
  'frame': PartType.FRAME,
  'rama': PartType.FRAME,
  'rahmen': PartType.FRAME,

  // === WIDELEC ===
  'fork': PartType.FORK,
  'widelec': PartType.FORK,
  'gabel': PartType.FORK,
  'front fork': PartType.FORK,
  'widelec przedni': PartType.FORK,

  // === WIDELEC AMORTYZOWANY ===
  'suspension fork': PartType.SUSPENSION_FORK,
  'widelec amortyzowany': PartType.SUSPENSION_FORK,
  'federgabel': PartType.SUSPENSION_FORK,

  // === STERY ===
  'headset': PartType.HEADSET,
  'stery': PartType.HEADSET,
  'steuersatz': PartType.HEADSET,

  // === SUPORT ===
  'bottom bracket': PartType.BOTTOM_BRACKET,
  'suport': PartType.BOTTOM_BRACKET,
  'bb': PartType.BOTTOM_BRACKET,
  'innenlager': PartType.BOTTOM_BRACKET,
  'tretlager': PartType.BOTTOM_BRACKET,

  // === KORBA ===
  'crankset': PartType.CRANKSET,
  'korba': PartType.CRANKSET,
  'korby': PartType.CRANKSET,
  'crank': PartType.CRANKSET,
  'kurbel': PartType.CRANKSET,
  'kurbelgarnitur': PartType.CRANKSET,

  // === ŁAŃCUCH ===
  'chain': PartType.CHAIN,
  'łańcuch': PartType.CHAIN,
  'lancuch': PartType.CHAIN,
  'kette': PartType.CHAIN,
  'chaîne': PartType.CHAIN,

  // === KASETA ===
  'cassette': PartType.CASSETTE,
  'kaseta': PartType.CASSETTE,
  'kassette': PartType.CASSETTE,
  'sprocket': PartType.CASSETTE,
  'freewheel': PartType.CASSETTE,

  // === PRZERZUTKA PRZEDNIA ===
  'front derailleur': PartType.DERAILLEUR_FRONT,
  'przerzutka przednia': PartType.DERAILLEUR_FRONT,
  'przerzutka przód': PartType.DERAILLEUR_FRONT,
  'umwerfer': PartType.DERAILLEUR_FRONT,
  'fd': PartType.DERAILLEUR_FRONT,

  // === PRZERZUTKA TYLNA ===
  'rear derailleur': PartType.DERAILLEUR_REAR,
  'przerzutka tylna': PartType.DERAILLEUR_REAR,
  'przerzutka tył': PartType.DERAILLEUR_REAR,
  'schaltwerk': PartType.DERAILLEUR_REAR,
  'rd': PartType.DERAILLEUR_REAR,
  'derailleur': PartType.DERAILLEUR_REAR, // default to rear

  // === MANETKI ===
  'shifters': PartType.SHIFTERS,
  'shifter': PartType.SHIFTERS,
  'manetki': PartType.SHIFTERS,
  'manetka': PartType.SHIFTERS,
  'dźwignie zmiany biegów': PartType.SHIFTERS,
  'schalthebel': PartType.SHIFTERS,
  'sti': PartType.SHIFTERS,

  // === KLOCKI HAMULCOWE PRZÓD ===
  'front brake pads': PartType.PADS_FRONT,
  'klocki przednie': PartType.PADS_FRONT,
  'klocki hamulcowe przednie': PartType.PADS_FRONT,
  'klocki przód': PartType.PADS_FRONT,
  'brake pads front': PartType.PADS_FRONT,

  // === KLOCKI HAMULCOWE TYŁ ===
  'rear brake pads': PartType.PADS_REAR,
  'klocki tylne': PartType.PADS_REAR,
  'klocki hamulcowe tylne': PartType.PADS_REAR,
  'klocki tył': PartType.PADS_REAR,
  'brake pads rear': PartType.PADS_REAR,

  // === KLOCKI (domyślnie przód) ===
  'brake pads': PartType.PADS_FRONT,
  'pads': PartType.PADS_FRONT,
  'klocki': PartType.PADS_FRONT,
  'klocki hamulcowe': PartType.PADS_FRONT,
  'bremsbeläge': PartType.PADS_FRONT,

  // === TARCZA HAMULCOWA PRZÓD ===
  'front disc': PartType.DISC_FRONT,
  'front rotor': PartType.DISC_FRONT,
  'tarcza przednia': PartType.DISC_FRONT,
  'tarcza hamulcowa przednia': PartType.DISC_FRONT,
  'rotor front': PartType.DISC_FRONT,

  // === TARCZA HAMULCOWA TYŁ ===
  'rear disc': PartType.DISC_REAR,
  'rear rotor': PartType.DISC_REAR,
  'tarcza tylna': PartType.DISC_REAR,
  'tarcza hamulcowa tylna': PartType.DISC_REAR,
  'rotor rear': PartType.DISC_REAR,

  // === TARCZA (domyślnie przód) ===
  'disc': PartType.DISC_FRONT,
  'rotor': PartType.DISC_FRONT,
  'tarcza': PartType.DISC_FRONT,
  'tarcza hamulcowa': PartType.DISC_FRONT,
  'bremsscheibe': PartType.DISC_FRONT,

  // === PIASTY ===
  'hubs': PartType.HUBS,
  'hub': PartType.HUBS,
  'piasty': PartType.HUBS,
  'piasta': PartType.HUBS,
  'naben': PartType.HUBS,

  // === OBRĘCZE ===
  'rims': PartType.RIMS,
  'rim': PartType.RIMS,
  'obręcze': PartType.RIMS,
  'obręcz': PartType.RIMS,
  'felgen': PartType.RIMS,
  'wheels': PartType.RIMS,
  'wheelset': PartType.RIMS,
  'koła': PartType.RIMS,

  // === SZPRYCHY ===
  'spokes': PartType.SPOKES,
  'szprychy': PartType.SPOKES,
  'speichen': PartType.SPOKES,

  // === OPONA PRZEDNIA ===
  'front tire': PartType.TIRE_FRONT,
  'front tyre': PartType.TIRE_FRONT,
  'opona przednia': PartType.TIRE_FRONT,
  'tire front': PartType.TIRE_FRONT,
  'vorderreifen': PartType.TIRE_FRONT,

  // === OPONA TYLNA ===
  'rear tire': PartType.TIRE_REAR,
  'rear tyre': PartType.TIRE_REAR,
  'opona tylna': PartType.TIRE_REAR,
  'tire rear': PartType.TIRE_REAR,
  'hinterreifen': PartType.TIRE_REAR,

  // === OPONA (domyślnie przód) ===
  'tire': PartType.TIRE_FRONT,
  'tyre': PartType.TIRE_FRONT,
  'tires': PartType.TIRE_FRONT,
  'tyres': PartType.TIRE_FRONT,
  'opona': PartType.TIRE_FRONT,
  'opony': PartType.TIRE_FRONT,
  'reifen': PartType.TIRE_FRONT,

  // === MLEKO TUBELESS ===
  'tubeless sealant': PartType.TUBELESS_SEALANT,
  'sealant': PartType.TUBELESS_SEALANT,
  'mleko tubeless': PartType.TUBELESS_SEALANT,
  'mleko': PartType.TUBELESS_SEALANT,
  'uszczelniacz': PartType.TUBELESS_SEALANT,
  'dichtmilch': PartType.TUBELESS_SEALANT,

  // === MOSTEK ===
  'stem': PartType.STEM,
  'mostek': PartType.STEM,
  'vorbau': PartType.STEM,

  // === KIEROWNICA ===
  'handlebar': PartType.HANDLEBAR,
  'handlebars': PartType.HANDLEBAR,
  'kierownica': PartType.HANDLEBAR,
  'lenker': PartType.HANDLEBAR,

  // === OWIJKA ===
  'handlebar tape': PartType.HANDLEBAR_TAPE,
  'bar tape': PartType.HANDLEBAR_TAPE,
  'owijka': PartType.HANDLEBAR_TAPE,
  'owijka kierownicy': PartType.HANDLEBAR_TAPE,
  'lenkerband': PartType.HANDLEBAR_TAPE,

  // === CHWYTY ===
  'grips': PartType.GRIPS,
  'chwyty': PartType.GRIPS,
  'griffe': PartType.GRIPS,

  // === SIODŁO ===
  'saddle': PartType.SADDLE,
  'siodło': PartType.SADDLE,
  'siodełko': PartType.SADDLE,
  'sattel': PartType.SADDLE,
  'seat': PartType.SADDLE,

  // === SZTYCA ===
  'seatpost': PartType.SEATPOST,
  'seat post': PartType.SEATPOST,
  'sztyca': PartType.SEATPOST,
  'sattelstütze': PartType.SEATPOST,

  // === SZTYCA AMORTYZOWANA ===
  'suspension seatpost': PartType.SUSPENSION_SEATPOST,
  'sztyca amortyzowana': PartType.SUSPENSION_SEATPOST,
  'gefederte sattelstütze': PartType.SUSPENSION_SEATPOST,

  // === SZTYCA REGULOWANA (DROPPER) ===
  'dropper post': PartType.DROPPER_POST,
  'dropper': PartType.DROPPER_POST,
  'sztyca regulowana': PartType.DROPPER_POST,
  'sztyca teleskopowa': PartType.DROPPER_POST,
  'variostütze': PartType.DROPPER_POST,

  // === SMAR ===
  'lubricant': PartType.LUBRICANT,
  'lube': PartType.LUBRICANT,
  'chain lube': PartType.LUBRICANT,
  'smar': PartType.LUBRICANT,
  'smar do łańcucha': PartType.LUBRICANT,
  'kettenöl': PartType.LUBRICANT,
  'schmiermittel': PartType.LUBRICANT,

  // === E-BIKE: SILNIK ===
  'motor': PartType.MOTOR,
  'silnik': PartType.MOTOR,
  'e-bike motor': PartType.MOTOR,
  'drive unit': PartType.MOTOR,

  // === E-BIKE: BATERIA ===
  'battery': PartType.BATTERY,
  'bateria': PartType.BATTERY,
  'akumulator': PartType.BATTERY,
  'akku': PartType.BATTERY,

  // === E-BIKE: KONTROLER ===
  'controller': PartType.CONTROLLER,
  'kontroler': PartType.CONTROLLER,
  'sterownik': PartType.CONTROLLER,
  'display': PartType.CONTROLLER,
}

/**
 * Mapuje surową nazwę typu części na PartType enum
 * @returns PartType lub null jeśli nie znaleziono mapowania
 */
export function mapToPartType(rawType: string): PartType | null {
  const normalized = rawType.toLowerCase().trim()

  // Dokładne dopasowanie
  if (PART_TYPE_MAPPINGS[normalized]) {
    return PART_TYPE_MAPPINGS[normalized]
  }

  // Częściowe dopasowanie - szukaj w obie strony
  for (const [pattern, partType] of Object.entries(PART_TYPE_MAPPINGS)) {
    if (normalized.includes(pattern) || pattern.includes(normalized)) {
      return partType
    }
  }

  return null
}

/**
 * Sprawdza czy typ części jest rozpoznawany
 */
export function isKnownPartType(rawType: string): boolean {
  return mapToPartType(rawType) !== null
}

/**
 * Zwraca wszystkie znane nazwy dla danego PartType
 */
export function getAliasesForPartType(partType: PartType): string[] {
  return Object.entries(PART_TYPE_MAPPINGS)
    .filter(([_, type]) => type === partType)
    .map(([alias, _]) => alias)
}

/**
 * Zwraca listę wszystkich PartType
 */
export function getAllPartTypes(): PartType[] {
  return Object.values(PartType)
}

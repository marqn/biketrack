import { BikeType, PartType } from "@/lib/generated/prisma";

// Nazwy części zależne od typu roweru
const BIKE_TYPE_PART_NAMES: Partial<Record<BikeType, Partial<Record<PartType, string>>>> = {
  ROAD: {
    [PartType.SHIFTERS]: "Klamkomanetki",
  },
  GRAVEL: {
    [PartType.SHIFTERS]: "Klamkomanetki",
  },
  TRAINER: {
    [PartType.FRAME]: "Trenażer",
  },
};

type DefaultPart = {
  type: PartType;
  expectedKm: number;
};

export const DEFAULT_PARTS: Record<BikeType, DefaultPart[]> = {
  ROAD: [
    // Rama i widelec
    { type: PartType.FRAME, expectedKm: 100000 },
    { type: PartType.FORK, expectedKm: 50000 },
    { type: PartType.HEADSET, expectedKm: 30000 },
    { type: PartType.BOTTOM_BRACKET, expectedKm: 15000 },
    // Napęd
    { type: PartType.CRANKSET, expectedKm: 30000 },
    { type: PartType.CHAIN, expectedKm: 2500 },
    { type: PartType.CASSETTE, expectedKm: 8000 },
    { type: PartType.DERAILLEUR_FRONT, expectedKm: 30000 },
    { type: PartType.DERAILLEUR_REAR, expectedKm: 20000 },
    { type: PartType.SHIFTERS, expectedKm: 30000 },
    { type: PartType.PEDALS, expectedKm: 30000 },
    { type: PartType.CLEATS, expectedKm: 5000 },
    { type: PartType.SHIFT_CABLES, expectedKm: 5000 },
    // Hamulce
    { type: PartType.PADS_FRONT, expectedKm: 3000 },
    { type: PartType.PADS_REAR, expectedKm: 3000 },
    { type: PartType.DISC_FRONT, expectedKm: 15000 },
    { type: PartType.DISC_REAR, expectedKm: 15000 },
    { type: PartType.BRAKE_CABLES, expectedKm: 3000 },
    { type: PartType.BRAKE_FLUID, expectedKm: 10000 },
    // Koła
    { type: PartType.HUBS, expectedKm: 30000 },
    { type: PartType.RIMS, expectedKm: 20000 },
    { type: PartType.SPOKES, expectedKm: 30000 },
    { type: PartType.TIRE_FRONT, expectedKm: 4000 },
    { type: PartType.TIRE_REAR, expectedKm: 4000 },
    { type: PartType.INNER_TUBE_FRONT, expectedKm: 4000 },
    { type: PartType.INNER_TUBE_REAR, expectedKm: 4000 },
    { type: PartType.TUBELESS_SEALANT_FRONT, expectedKm: 3000 },
    { type: PartType.TUBELESS_SEALANT_REAR, expectedKm: 3000 },
    // Cockpit
    { type: PartType.STEM, expectedKm: 50000 },
    { type: PartType.HANDLEBAR, expectedKm: 30000 },
    { type: PartType.HANDLEBAR_TAPE, expectedKm: 6000 },
    // Siodło
    { type: PartType.SADDLE, expectedKm: 20000 },
    { type: PartType.SEATPOST, expectedKm: 50000 },
    // Akcesoria
    { type: PartType.BOTTLE_CAGE, expectedKm: 50000 },
    { type: PartType.LIGHT_FRONT, expectedKm: 20000 },
    { type: PartType.LIGHT_REAR, expectedKm: 20000 },
    { type: PartType.COMPUTER, expectedKm: 50000 },
  ],
  GRAVEL: [
    // Rama i widelec
    { type: PartType.FRAME, expectedKm: 80000 },
    { type: PartType.FORK, expectedKm: 40000 },
    { type: PartType.HEADSET, expectedKm: 25000 },
    { type: PartType.BOTTOM_BRACKET, expectedKm: 12000 },
    // Napęd
    { type: PartType.CRANKSET, expectedKm: 25000 },
    { type: PartType.CHAIN, expectedKm: 2000 },
    { type: PartType.CASSETTE, expectedKm: 6000 },
    { type: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
    { type: PartType.SHIFTERS, expectedKm: 25000 },
    { type: PartType.PEDALS, expectedKm: 25000 },
    { type: PartType.CLEATS, expectedKm: 5000 },
    { type: PartType.SHIFT_CABLES, expectedKm: 4000 },
    // Hamulce
    { type: PartType.PADS_FRONT, expectedKm: 2500 },
    { type: PartType.PADS_REAR, expectedKm: 2500 },
    { type: PartType.DISC_FRONT, expectedKm: 12000 },
    { type: PartType.DISC_REAR, expectedKm: 12000 },
    { type: PartType.BRAKE_CABLES, expectedKm: 2500 },
    { type: PartType.BRAKE_FLUID, expectedKm: 10000 },
    // Koła
    { type: PartType.HUBS, expectedKm: 25000 },
    { type: PartType.RIMS, expectedKm: 15000 },
    { type: PartType.SPOKES, expectedKm: 25000 },
    { type: PartType.TIRE_FRONT, expectedKm: 3500 },
    { type: PartType.TIRE_REAR, expectedKm: 3500 },
    { type: PartType.INNER_TUBE_FRONT, expectedKm: 3500 },
    { type: PartType.INNER_TUBE_REAR, expectedKm: 3500 },
    { type: PartType.TUBELESS_SEALANT_FRONT, expectedKm: 3000 },
    { type: PartType.TUBELESS_SEALANT_REAR, expectedKm: 3000 },
    // Cockpit
    { type: PartType.STEM, expectedKm: 40000 },
    { type: PartType.HANDLEBAR, expectedKm: 25000 },
    { type: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
    // Siodło
    { type: PartType.SADDLE, expectedKm: 15000 },
    { type: PartType.SEATPOST, expectedKm: 40000 },
    // Akcesoria
    { type: PartType.FENDER_FRONT, expectedKm: 50000 },
    { type: PartType.FENDER_REAR, expectedKm: 50000 },
    { type: PartType.BOTTLE_CAGE, expectedKm: 50000 },
    { type: PartType.BAG_SADDLE, expectedKm: 30000 },
    { type: PartType.LIGHT_FRONT, expectedKm: 20000 },
    { type: PartType.LIGHT_REAR, expectedKm: 20000 },
    { type: PartType.COMPUTER, expectedKm: 50000 },
  ],
  MTB: [
    // Rama i widelec
    { type: PartType.FRAME, expectedKm: 60000 },
    { type: PartType.SUSPENSION_FORK, expectedKm: 10000 },
    { type: PartType.HEADSET, expectedKm: 20000 },
    { type: PartType.BOTTOM_BRACKET, expectedKm: 10000 },
    // Napęd
    { type: PartType.CRANKSET, expectedKm: 20000 },
    { type: PartType.CHAIN, expectedKm: 1800 },
    { type: PartType.CASSETTE, expectedKm: 5000 },
    { type: PartType.DERAILLEUR_REAR, expectedKm: 12000 },
    { type: PartType.SHIFTERS, expectedKm: 20000 },
    { type: PartType.PEDALS, expectedKm: 20000 },
    { type: PartType.CLEATS, expectedKm: 5000 },
    { type: PartType.SHIFT_CABLES, expectedKm: 3500 },
    // Hamulce
    { type: PartType.PADS_FRONT, expectedKm: 2000 },
    { type: PartType.PADS_REAR, expectedKm: 2000 },
    { type: PartType.DISC_FRONT, expectedKm: 10000 },
    { type: PartType.DISC_REAR, expectedKm: 10000 },
    { type: PartType.BRAKE_CABLES, expectedKm: 2000 },
    { type: PartType.BRAKE_FLUID, expectedKm: 10000 },
    // Koła
    { type: PartType.HUBS, expectedKm: 20000 },
    { type: PartType.RIMS, expectedKm: 12000 },
    { type: PartType.SPOKES, expectedKm: 20000 },
    { type: PartType.TIRE_FRONT, expectedKm: 3000 },
    { type: PartType.TIRE_REAR, expectedKm: 3000 },
    { type: PartType.INNER_TUBE_FRONT, expectedKm: 3000 },
    { type: PartType.INNER_TUBE_REAR, expectedKm: 3000 },
    { type: PartType.TUBELESS_SEALANT_FRONT, expectedKm: 3000 },
    { type: PartType.TUBELESS_SEALANT_REAR, expectedKm: 3000 },
    // Cockpit
    { type: PartType.STEM, expectedKm: 30000 },
    { type: PartType.HANDLEBAR, expectedKm: 20000 },
    { type: PartType.GRIPS, expectedKm: 5000 },
    // Siodło
    { type: PartType.SADDLE, expectedKm: 12000 },
    { type: PartType.DROPPER_POST, expectedKm: 8000 },
    // Akcesoria
    { type: PartType.BOTTLE_CAGE, expectedKm: 50000 },
    { type: PartType.LIGHT_FRONT, expectedKm: 20000 },
    { type: PartType.LIGHT_REAR, expectedKm: 20000 },
    { type: PartType.COMPUTER, expectedKm: 50000 },
  ],
  OTHER: [
    // Rama i widelec
    { type: PartType.FRAME, expectedKm: 80000 },
    { type: PartType.FORK, expectedKm: 40000 },
    { type: PartType.HEADSET, expectedKm: 25000 },
    { type: PartType.BOTTOM_BRACKET, expectedKm: 12000 },
    // Napęd
    { type: PartType.CRANKSET, expectedKm: 25000 },
    { type: PartType.CHAIN, expectedKm: 1800 },
    { type: PartType.CASSETTE, expectedKm: 5000 },
    { type: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
    { type: PartType.SHIFTERS, expectedKm: 25000 },
    { type: PartType.PEDALS, expectedKm: 25000 },
    { type: PartType.SHIFT_CABLES, expectedKm: 4000 },
    // Hamulce
    { type: PartType.PADS_FRONT, expectedKm: 2000 },
    { type: PartType.PADS_REAR, expectedKm: 2000 },
    { type: PartType.BRAKE_CABLES, expectedKm: 2500 },
    { type: PartType.BRAKE_FLUID, expectedKm: 10000 },
    // Koła
    { type: PartType.HUBS, expectedKm: 25000 },
    { type: PartType.RIMS, expectedKm: 15000 },
    { type: PartType.SPOKES, expectedKm: 25000 },
    { type: PartType.TIRE_FRONT, expectedKm: 3000 },
    { type: PartType.TIRE_REAR, expectedKm: 3000 },
    { type: PartType.INNER_TUBE_FRONT, expectedKm: 3000 },
    { type: PartType.INNER_TUBE_REAR, expectedKm: 3000 },
    { type: PartType.TUBELESS_SEALANT_FRONT, expectedKm: 3000 },
    { type: PartType.TUBELESS_SEALANT_REAR, expectedKm: 3000 },
    // Cockpit
    { type: PartType.STEM, expectedKm: 40000 },
    { type: PartType.HANDLEBAR, expectedKm: 25000 },
    { type: PartType.GRIPS, expectedKm: 5000 },
    // Siodło
    { type: PartType.SADDLE, expectedKm: 15000 },
    { type: PartType.SUSPENSION_SEATPOST, expectedKm: 10000 },
    // Akcesoria (turystyczne)
    { type: PartType.FENDER_FRONT, expectedKm: 50000 },
    { type: PartType.FENDER_REAR, expectedKm: 50000 },
    { type: PartType.KICKSTAND, expectedKm: 100000 },
    { type: PartType.RACK, expectedKm: 80000 },
    { type: PartType.BAG_SADDLE, expectedKm: 30000 },
    { type: PartType.BOTTLE_CAGE, expectedKm: 50000 },
    { type: PartType.LIGHT_FRONT, expectedKm: 20000 },
    { type: PartType.LIGHT_REAR, expectedKm: 20000 },
    { type: PartType.BELL, expectedKm: 100000 },
    { type: PartType.COMPUTER, expectedKm: 50000 },
  ],
  TRAINER: [
    // Trenażer (jednostka)
    { type: PartType.FRAME, expectedKm: 100000 },
    { type: PartType.HEADSET, expectedKm: 50000 },
    { type: PartType.BOTTOM_BRACKET, expectedKm: 20000 },
    // Napęd
    { type: PartType.CRANKSET, expectedKm: 40000 },
    { type: PartType.CHAIN, expectedKm: 5000 },
    { type: PartType.CASSETTE, expectedKm: 12000 },
    { type: PartType.PEDALS, expectedKm: 40000 },
    { type: PartType.CLEATS, expectedKm: 8000 },
    // Kokpit
    { type: PartType.STEM, expectedKm: 100000 },
    { type: PartType.HANDLEBAR, expectedKm: 50000 },
    { type: PartType.GRIPS, expectedKm: 3000 },
    // Siodło
    { type: PartType.SADDLE, expectedKm: 15000 },
    { type: PartType.SEATPOST, expectedKm: 100000 },
    // Akcesoria
    { type: PartType.BOTTLE_CAGE, expectedKm: 100000 },
    { type: PartType.COMPUTER, expectedKm: 50000 },
  ],
};

// Pełne nazwy części (bez emoji)
export const PART_NAMES: Record<PartType, string> = {
  // Rama i widelec
  [PartType.FRAME]: "Rama",
  [PartType.FORK]: "Widelec",
  [PartType.SUSPENSION_FORK]: "Widelec amortyzowany",
  // Stery i suport
  [PartType.HEADSET]: "Stery",
  [PartType.BOTTOM_BRACKET]: "Suport",
  // Napęd
  [PartType.CRANKSET]: "Mechanizm korbowy",
  [PartType.CHAIN]: "Łańcuch",
  [PartType.CASSETTE]: "Kaseta",
  [PartType.DERAILLEUR_FRONT]: "Przerzutka przód",
  [PartType.DERAILLEUR_REAR]: "Przerzutka tył",
  [PartType.SHIFTERS]: "Manetki",
  [PartType.PEDALS]: "Pedały",
  [PartType.CLEATS]: "Bloki SPD",
  [PartType.SHIFT_CABLES]: "Linki przerzutki",
  // Hamulce
  [PartType.PADS_FRONT]: "Klocki przednie",
  [PartType.PADS_REAR]: "Klocki tylne",
  [PartType.DISC_FRONT]: "Tarcza przednia",
  [PartType.DISC_REAR]: "Tarcza tylna",
  [PartType.BRAKE_CABLES]: "Linki hamulcowe",
  [PartType.BRAKE_FLUID]: "Płyn hamulcowy",
  // Koła
  [PartType.HUBS]: "Piasty",
  [PartType.RIMS]: "Obręcze",
  [PartType.SPOKES]: "Szprychy",
  [PartType.TIRE_FRONT]: "Opona przednia",
  [PartType.TIRE_REAR]: "Opona tylna",
  [PartType.INNER_TUBE_FRONT]: "Dętka przednia",
  [PartType.INNER_TUBE_REAR]: "Dętka tylna",
  [PartType.TUBELESS_SEALANT_FRONT]: "Mleko tubeless przód",
  [PartType.TUBELESS_SEALANT_REAR]: "Mleko tubeless tył",
  // Cockpit
  [PartType.STEM]: "Mostek",
  [PartType.HANDLEBAR]: "Kierownica",
  [PartType.HANDLEBAR_TAPE]: "Owijka kierownicy",
  [PartType.GRIPS]: "Chwyty",
  // Siodło
  [PartType.SADDLE]: "Siodło",
  [PartType.SEATPOST]: "Sztyca",
  [PartType.SUSPENSION_SEATPOST]: "Sztyca amortyzowana",
  [PartType.DROPPER_POST]: "Sztyca teleskopowa",
  // Akcesoria
  [PartType.FENDER_FRONT]: "Błotnik przedni",
  [PartType.FENDER_REAR]: "Błotnik tylny",
  [PartType.KICKSTAND]: "Stopka",
  [PartType.RACK]: "Bagażnik",
  [PartType.BAG_SADDLE]: "Torba podsiodłowa",
  [PartType.BAG_FRAME]: "Torba na ramę",
  [PartType.BOTTLE_CAGE]: "Koszyk na bidon",
  [PartType.LIGHT_FRONT]: "Lampka przednia",
  [PartType.LIGHT_REAR]: "Lampka tylna",
  [PartType.BELL]: "Dzwonek",
  [PartType.COMPUTER]: "Licznik",
  // Inne
  [PartType.LUBRICANT]: "Smar do łańcucha",
  // E-bike
  [PartType.MOTOR]: "Silnik",
  [PartType.BATTERY]: "Akumulator",
  [PartType.CONTROLLER]: "Sterownik",
  // Przestarzałe
  [PartType.TUBELESS_SEALANT]: "Mleko tubeless",
  [PartType.CHAINRING_1X]: "Zębatka 1x",
  [PartType.BRAKES]: "Hamulce",
  [PartType.BRAKE_LEVERS]: "Klamki hamulcowe",
};

// Emoji dla każdego typu części
export const PART_ICONS: Record<PartType, string> = {
  // Rama i widelec
  [PartType.FRAME]: "📐",
  [PartType.FORK]: "🍴",
  [PartType.SUSPENSION_FORK]: "🍴",
  // Stery i suport
  [PartType.HEADSET]: "🔩",
  [PartType.BOTTOM_BRACKET]: "⚙️",
  // Napęd
  [PartType.CRANKSET]: "🦵",
  [PartType.CHAIN]: "⛓️",
  [PartType.CASSETTE]: "⚙️",
  [PartType.DERAILLEUR_FRONT]: "↔️",
  [PartType.DERAILLEUR_REAR]: "↔️",
  [PartType.SHIFTERS]: "🎚️",
  [PartType.PEDALS]: "🦶",
  [PartType.CLEATS]: "👟",
  [PartType.SHIFT_CABLES]: "🪢",
  // Hamulce
  [PartType.PADS_FRONT]: "🧱",
  [PartType.PADS_REAR]: "🧱",
  [PartType.DISC_FRONT]: "💿",
  [PartType.DISC_REAR]: "💿",
  [PartType.BRAKE_CABLES]: "🪢",
  [PartType.BRAKE_FLUID]: "💧",
  // Koła
  [PartType.HUBS]: "🎯",
  [PartType.RIMS]: "⭕",
  [PartType.SPOKES]: "📍",
  [PartType.TIRE_FRONT]: "⭕",
  [PartType.TIRE_REAR]: "⭕",
  [PartType.INNER_TUBE_FRONT]: "🔵",
  [PartType.INNER_TUBE_REAR]: "🔵",
  [PartType.TUBELESS_SEALANT_FRONT]: "🧴",
  [PartType.TUBELESS_SEALANT_REAR]: "🧴",
  // Cockpit
  [PartType.STEM]: "🔧",
  [PartType.HANDLEBAR]: "🎛️",
  [PartType.HANDLEBAR_TAPE]: "🪢",
  [PartType.GRIPS]: "🤜",
  // Siodło
  [PartType.SADDLE]: "🪑",
  [PartType.SEATPOST]: "📏",
  [PartType.SUSPENSION_SEATPOST]: "📏",
  [PartType.DROPPER_POST]: "📏",
  // Akcesoria
  [PartType.FENDER_FRONT]: "🛡️",
  [PartType.FENDER_REAR]: "🛡️",
  [PartType.KICKSTAND]: "🦵",
  [PartType.RACK]: "📦",
  [PartType.BAG_SADDLE]: "👜",
  [PartType.BAG_FRAME]: "🎒",
  [PartType.BOTTLE_CAGE]: "🧃",
  [PartType.LIGHT_FRONT]: "🔦",
  [PartType.LIGHT_REAR]: "🔴",
  [PartType.BELL]: "🔔",
  [PartType.COMPUTER]: "📟",
  // Inne
  [PartType.LUBRICANT]: "💧",
  // E-bike
  [PartType.MOTOR]: "⚡",
  [PartType.BATTERY]: "🔋",
  [PartType.CONTROLLER]: "🎛️",
  // Przestarzałe
  [PartType.TUBELESS_SEALANT]: "🧴",
  [PartType.CHAINRING_1X]: "⚙️",
  [PartType.BRAKES]: "🛑",
  [PartType.BRAKE_LEVERS]: "🎚️",
};

// UI format (emoji | nazwa) - zachowane dla kompatybilności wstecznej
export const PART_UI: Record<PartType, string> = Object.fromEntries(
  Object.entries(PART_NAMES).map(([key, name]) => [
    key,
    `${PART_ICONS[key as PartType]} | ${name}`,
  ])
) as Record<PartType, string>;

// Funkcje pomocnicze
export function getPartName(partType: PartType | string): string {
  return PART_NAMES[partType as PartType] || String(partType);
}

export function getPartNameForBike(partType: PartType, bikeType?: BikeType, partSpecificData?: unknown): string {
  // Dla SHIFTERS na szosie: checkbox "isClassicShifter" → "Manetki" zamiast "Klamkomanetki"
  if (partType === PartType.SHIFTERS && partSpecificData) {
    const data = partSpecificData as Record<string, unknown>;
    if (data.isClassicShifter) return PART_NAMES[partType];
  }
  if (bikeType) {
    const override = BIKE_TYPE_PART_NAMES[bikeType]?.[partType];
    if (override) return override;
  }
  return PART_NAMES[partType] || String(partType);
}

export function getPartUIForBike(partType: PartType, bikeType?: BikeType, partSpecificData?: unknown): string {
  const name = getPartNameForBike(partType, bikeType, partSpecificData);
  return `${PART_ICONS[partType] || ""} | ${name}`;
}

export function getPartIcon(partType: PartType | string): string {
  return PART_ICONS[partType as PartType] || "";
}

export const CHAIN_LUBE_INTERVAL_KM = 200;
export const SEALANT_INTERVAL_DAYS = 90;
export const BRAKE_FLUID_INTERVAL_DAYS = 730; // 2 lata

// Kategorie części rowerowych
export type PartCategory = "frame" | "drivetrain" | "brakes" | "wheels" | "cockpit" | "accessories";

export const PART_CATEGORIES: Record<PartCategory, { label: string; types: PartType[] }> = {
  frame: {
    label: "Rama",
    types: [PartType.FRAME, PartType.FORK, PartType.SUSPENSION_FORK],
  },
  drivetrain: {
    label: "Napęd",
    types: [
      PartType.MOTOR,
      PartType.BATTERY,
      PartType.CONTROLLER,
      PartType.CRANKSET,
      PartType.CHAIN,
      PartType.CASSETTE,
      PartType.BOTTOM_BRACKET,
      PartType.DERAILLEUR_FRONT,
      PartType.DERAILLEUR_REAR,
      PartType.SHIFTERS,
      PartType.PEDALS,
      PartType.CLEATS,
      PartType.SHIFT_CABLES,
    ],
  },
  brakes: {
    label: "Hamulce",
    types: [
      PartType.PADS_FRONT,
      PartType.PADS_REAR,
      PartType.DISC_FRONT,
      PartType.DISC_REAR,
      PartType.BRAKE_CABLES,
      PartType.BRAKE_FLUID,
    ],
  },
  wheels: {
    label: "Koła",
    types: [
      PartType.HUBS,
      PartType.RIMS,
      PartType.SPOKES,
      PartType.TIRE_FRONT,
      PartType.TIRE_REAR,
      PartType.INNER_TUBE_FRONT,
      PartType.INNER_TUBE_REAR,
      PartType.TUBELESS_SEALANT_FRONT,
      PartType.TUBELESS_SEALANT_REAR,
    ],
  },
  cockpit: {
    label: "Kokpit",
    types: [
      PartType.HEADSET,
      PartType.STEM,
      PartType.HANDLEBAR,
      PartType.HANDLEBAR_TAPE,
      PartType.GRIPS,
      PartType.SADDLE,
      PartType.SEATPOST,
      PartType.SUSPENSION_SEATPOST,
      PartType.DROPPER_POST,
    ],
  },
  accessories: {
    label: "Akcesoria",
    types: [
      PartType.FENDER_FRONT,
      PartType.FENDER_REAR,
      PartType.KICKSTAND,
      PartType.RACK,
      PartType.BAG_SADDLE,
      PartType.BAG_FRAME,
      PartType.BOTTLE_CAGE,
      PartType.LIGHT_FRONT,
      PartType.LIGHT_REAR,
      PartType.BELL,
      PartType.COMPUTER,
    ],
  },
};

// Funkcja do znalezienia kategorii dla danego typu części
export function getPartCategory(partType: PartType): PartCategory | null {
  for (const [category, data] of Object.entries(PART_CATEGORIES)) {
    if (data.types.includes(partType)) {
      return category as PartCategory;
    }
  }
  return null;
}

// Domyślne części dla rowerów elektrycznych
export const EBIKE_PARTS: DefaultPart[] = [
  { type: PartType.MOTOR, expectedKm: 50000 },
  { type: PartType.BATTERY, expectedKm: 30000 },
  { type: PartType.CONTROLLER, expectedKm: 40000 },
];

// Warunkowa widoczność części na podstawie typu hamulców
export type BrakeType = "rim" | "disc" | "disc-hydraulic" | "v-brake";

export function getHiddenPartsByBrakeType(brakeType: BrakeType | undefined): Set<PartType> {
  const hidden = new Set<PartType>();
  switch (brakeType) {
    case "disc-hydraulic":
      hidden.add(PartType.BRAKE_CABLES);
      break;
    case "disc":
      hidden.add(PartType.BRAKE_FLUID);
      break;
    case "rim":
    case "v-brake":
      hidden.add(PartType.BRAKE_FLUID);
      hidden.add(PartType.DISC_FRONT);
      hidden.add(PartType.DISC_REAR);
      break;
    default:
      hidden.add(PartType.BRAKE_FLUID);
      break;
  }
  return hidden;
}

export function extractBrakeType(
  parts: Array<{ type: PartType; partSpecificData?: unknown }>
): BrakeType | undefined {
  const framePart = parts.find((p) => p.type === PartType.FRAME);
  if (!framePart?.partSpecificData) return undefined;
  const data = framePart.partSpecificData as Record<string, unknown>;
  return data.brakeType as BrakeType | undefined;
}

// Warunkowa widoczność dętek/mleka na podstawie tubeless w oponach
export function extractTubelessStatus(
  parts: Array<{ type: PartType; partSpecificData?: unknown }>
): { front: boolean; rear: boolean } {
  const frontTire = parts.find((p) => p.type === PartType.TIRE_FRONT);
  const rearTire = parts.find((p) => p.type === PartType.TIRE_REAR);
  const frontData = frontTire?.partSpecificData as Record<string, unknown> | undefined;
  const rearData = rearTire?.partSpecificData as Record<string, unknown> | undefined;
  return {
    front: !!frontData?.tubelessReady,
    rear: !!rearData?.tubelessReady,
  };
}

export function getHiddenPartsByTubelessStatus(
  tubeless: { front: boolean; rear: boolean }
): Set<PartType> {
  const hidden = new Set<PartType>();
  // Mleko tubeless jest teraz prezentowane wewnątrz kart opon (jak smarowanie w łańcuchu)
  // — zawsze ukrywamy osobne karty mleka
  hidden.add(PartType.TUBELESS_SEALANT_FRONT);
  hidden.add(PartType.TUBELESS_SEALANT_REAR);
  if (tubeless.front) {
    hidden.add(PartType.INNER_TUBE_FRONT);
  }
  if (tubeless.rear) {
    hidden.add(PartType.INNER_TUBE_REAR);
  }
  return hidden;
}

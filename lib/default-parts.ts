import { BikeType, PartType } from "@/lib/generated/prisma";

type DefaultPart = {
  type: PartType;
  expectedKm: number;
};

export const DEFAULT_PARTS: Record<BikeType, DefaultPart[]> = {
  ROAD: [
    { type: PartType.CHAIN, expectedKm: 2500 },
    { type: PartType.CASSETTE, expectedKm: 8000 },
    { type: PartType.PADS_FRONT, expectedKm: 3000 },
    { type: PartType.PADS_REAR, expectedKm: 3000 },
    { type: PartType.TIRE_FRONT, expectedKm: 4000 },
    { type: PartType.TIRE_REAR, expectedKm: 4000 },
    { type: PartType.CHAINRING_1X, expectedKm: 10000 },
    { type: PartType.HANDLEBAR_TAPE, expectedKm: 6000 },
  ],
  GRAVEL: [
    { type: PartType.CHAIN, expectedKm: 2000 },
    { type: PartType.CASSETTE, expectedKm: 6000 },
    { type: PartType.PADS_FRONT, expectedKm: 2500 },
    { type: PartType.PADS_REAR, expectedKm: 2500 },
    { type: PartType.TIRE_FRONT, expectedKm: 3500 },
    { type: PartType.TIRE_REAR, expectedKm: 3500 },
    { type: PartType.CHAINRING_1X, expectedKm: 10000 },
    { type: PartType.TUBELESS_SEALANT, expectedKm: 3000 }
  ],
  MTB: [
    { type: PartType.CHAIN, expectedKm: 1800 },
    { type: PartType.CASSETTE, expectedKm: 5000 },
    { type: PartType.PADS_FRONT, expectedKm: 2000 },
    { type: PartType.PADS_REAR, expectedKm: 2000 },
    { type: PartType.TIRE_FRONT, expectedKm: 3000 },
    { type: PartType.TIRE_REAR, expectedKm: 3000 },
    { type: PartType.CHAINRING_1X, expectedKm: 10000 },
    { type: PartType.TUBELESS_SEALANT, expectedKm: 3000 },
    { type: PartType.SUSPENSION_FORK, expectedKm: 10000 },
    { type: PartType.DROPPER_POST, expectedKm: 8000 },
  ],
  OTHER: [
    { type: PartType.CHAIN, expectedKm: 1800 },
    { type: PartType.CASSETTE, expectedKm: 5000 },
    { type: PartType.PADS_FRONT, expectedKm: 2000 },
    { type: PartType.PADS_REAR, expectedKm: 2000 },
    { type: PartType.TIRE_FRONT, expectedKm: 3000 },
    { type: PartType.TIRE_REAR, expectedKm: 3000 },
    { type: PartType.CHAINRING_1X, expectedKm: 10000 },
    { type: PartType.SUSPENSION_SEATPOST, expectedKm: 10000 },
  ],
};

// Pełne nazwy części (bez emoji)
export const PART_NAMES: Record<PartType, string> = {
  [PartType.CHAIN]: "Łańcuch",
  [PartType.CASSETTE]: "Kaseta",
  [PartType.PADS_FRONT]: "Klocki hamulcowe przednie",
  [PartType.PADS_REAR]: "Klocki hamulcowe tylne",
  [PartType.TIRE_FRONT]: "Opona przednia",
  [PartType.TIRE_REAR]: "Opona tylna",
  [PartType.CHAINRING_1X]: "Zębatka 1x",
  [PartType.HANDLEBAR_TAPE]: "Owijka kierownicy",
  [PartType.SUSPENSION_FORK]: "Widelec amortyzowany",
  [PartType.DROPPER_POST]: "Sztyca teleskopowa",
  [PartType.TUBELESS_SEALANT]: "Mleczko tubeless",
  [PartType.SUSPENSION_SEATPOST]: "Sztyca amortyzowana",
  [PartType.LUBRICANT]: "Smar/Wosk do łańcucha",
};

// Emoji dla każdego typu części
export const PART_ICONS: Record<PartType, string> = {
  [PartType.CHAIN]: "⛓️",
  [PartType.CASSETTE]: "⚙️",
  [PartType.PADS_FRONT]: "🧱⬅️",
  [PartType.PADS_REAR]: "🧱➡️",
  [PartType.TIRE_FRONT]: "🛞⬅️",
  [PartType.TIRE_REAR]: "🛞➡️",
  [PartType.CHAINRING_1X]: "🦀",
  [PartType.HANDLEBAR_TAPE]: "🪢",
  [PartType.SUSPENSION_FORK]: "🪵",
  [PartType.DROPPER_POST]: "🪵",
  [PartType.TUBELESS_SEALANT]: "🧼",
  [PartType.SUSPENSION_SEATPOST]: "🪵",
  [PartType.LUBRICANT]: "💧",
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

export function getPartIcon(partType: PartType | string): string {
  return PART_ICONS[partType as PartType] || "";
}

export const CHAIN_LUBE_INTERVAL_KM = 200;
export const SEALANT_INTERVAL_DAYS = 90;
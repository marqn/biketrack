import { PartType } from "@/lib/generated/prisma";

export type TireSpecificData = {
  beadType: "wired" | "folding";
  tubelessReady: boolean;
  hookless: boolean;
  treadType: "slick" | "semi-slick";
  sizeFormat: "imperial" | "french";
  sizeImperial?: string;
  sizeFrench?: string;
};

export type ChainSpecificData = {
  speeds: 1 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
};

export type CassetteSpecificData = {
  range: string;
  speeds: 1 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
};

export type PadsSpecificData = {
  rimBrake: boolean;
  material?: "semi-metallic" | "resin-kevlar" | "ceramic" | "metallic" | "mixed" | "organic" | "organic-radiator" | "metallic-radiator" | "semi-metallic-radiator";
  rim?: "aluminum" | "carbon";
};

export type DiscSpecificData = {
  discMount: "centerlock" | "6-bolt";
  size: "140" | "160" | "180" | "183" | "200" | "203" | "220" | "223";
};

export type ForkSpecificData = {
  wheelSize: "20" | "26" | "27.5" | "28" | "29";
  material: "aluminum" | "steel" | "carbon" | "titanium";
};

export type SeatpostSpecificData = {
  material: "aluminum" | "carbon";
};

export type SpokesSpecificData = {
  material: "aluminum" | "brass" | "stainless-steel";
};

export type RimsSpecificData = {
  material: "aluminum" | "carbon";
  rimDepth: number; // mm (profil obręczy)
  internalWidth: number; // mm (szerokość wewnętrzna)
  hookless: boolean;
  tubelessReady: boolean;
  brakeType: "disc" | "rim";
  wheelSize: "26" | "27.5" | "28" | "29";
};

export type HubsSpecificData = {
  discMount: "centerlock" | "6-bolt" | "none";
  bearings: "loose-ball" | "cartridge";
  holes: 24 | 28 | 32 | 36;
};

export type FrameSpecificData = {
  material: "aluminum" | "carbon" | "titanium" | "steel";
  brakeType: "rim" | "disc" | "disc-hydraulic" | "v-brake";
  wheelSize: "24" | "26" | "27.5" | "28" | "29";
  frameSize: "xs" | "s" | "m" | "l" | "xl" | "xxl" | "one-size";
  gender: "women" | "men" | "unisex";
};

export type BottomBracketSpecificData = {
  shellType: "square" | "bsa" | "ita" | "t47" | "press-fit";
};

export type CranksetSpecificData = {
  chainring: 28 | 30 | 32 | 34 | 36 | 38 | 39 | 40 | 42 | 46 | 48;
  length: "160" | "165" | "167.5" | "170" | "172.5" | "175" | "177.5";
};

export type SuspensionSpecificData = {
  travel: number; // mm
};

export type TubelessSealantSpecificData = {
  volume: number; // ml
};

export type PedalsSpecificData = {
  clipless: "no" | "yes" | "one-sided" | "magnetic" | "two-sided";
  bearings: "ceramic" | "needle" | "ball" | "cartridge" | "steel" | "bushing";
  platform: boolean;
  bodyMaterial: "aluminum" | "carbon" | "composite" | "nylon" | "steel" | "magnesium" | "plastic" | "titanium" | "fiberglass";
};

export type DerailleurRearSpecificData = {
  speeds: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  derailleurType: "mechanical" | "electronic" | "wireless";
  drivetrain: string;
};

export type HeadsetSpecificData = {
  bearings: "loose-ball" | "cartridge";
};

export type HandlebarSpecificData = {
  material: "aluminum" | "carbon";
  width: number; // mm (400-750)
};

export type HandlebarTapeSpecificData = {
  material: "velvet" | "eva" | "kraton" | "cork" | "rubber" | "foam" | "polyurethane" | "silicone" | "leather" | "solocush" | "synthetic-leather" | "gel" | "nylon" | "organic-cotton";
  thickness: number; // mm (1.5-4.5)
};

export type StemSpecificData = {
  length: number; // mm (30-150)
  angle: number; // degrees (0-90)
  material: "aluminum" | "carbon";
};

export type LubricantSpecificData = {
  lubricantType: "wax" | "oil";
};

export type MotorSpecificData = {
  power: number; // W (watt)
  motorType: "mid-drive" | "hub-front" | "hub-rear";
};

export type BatterySpecificData = {
  capacity: number; // Wh
  voltage: number; // V
};

export type ControllerSpecificData = Record<string, never>;

export type PartSpecificDataMap = {
  [PartType.FRAME]: FrameSpecificData;
  [PartType.TIRE_FRONT]: TireSpecificData;
  [PartType.TIRE_REAR]: TireSpecificData;
  [PartType.CHAIN]: ChainSpecificData;
  [PartType.CASSETTE]: CassetteSpecificData;
  [PartType.PADS_FRONT]: PadsSpecificData;
  [PartType.PADS_REAR]: PadsSpecificData;
  [PartType.DISC_FRONT]: DiscSpecificData;
  [PartType.DISC_REAR]: DiscSpecificData;
  [PartType.FORK]: ForkSpecificData;
  [PartType.SEATPOST]: SeatpostSpecificData;
  [PartType.SPOKES]: SpokesSpecificData;
  [PartType.HUBS]: HubsSpecificData;
  [PartType.BOTTOM_BRACKET]: BottomBracketSpecificData;
  [PartType.CRANKSET]: CranksetSpecificData;
  [PartType.SUSPENSION_FORK]: SuspensionSpecificData;
  [PartType.TUBELESS_SEALANT]: TubelessSealantSpecificData;
  [PartType.DROPPER_POST]: SuspensionSpecificData;
  [PartType.SUSPENSION_SEATPOST]: SuspensionSpecificData;
  [PartType.PEDALS]: PedalsSpecificData;
  [PartType.DERAILLEUR_REAR]: DerailleurRearSpecificData;
  [PartType.STEM]: StemSpecificData;
  [PartType.HEADSET]: HeadsetSpecificData;
  [PartType.HANDLEBAR]: HandlebarSpecificData;
  [PartType.HANDLEBAR_TAPE]: HandlebarTapeSpecificData;
  [PartType.LUBRICANT]: LubricantSpecificData;
  // E-bike
  [PartType.MOTOR]: MotorSpecificData;
  [PartType.BATTERY]: BatterySpecificData;
  [PartType.CONTROLLER]: ControllerSpecificData;
  // Bez specyficznych pól
  [PartType.DERAILLEUR_FRONT]: Record<string, never>;
  [PartType.SHIFTERS]: Record<string, never>;
  [PartType.CLEATS]: Record<string, never>;
  [PartType.RIMS]: RimsSpecificData;
  [PartType.GRIPS]: Record<string, never>;
  [PartType.SADDLE]: Record<string, never>;
  [PartType.FENDER_FRONT]: Record<string, never>;
  [PartType.FENDER_REAR]: Record<string, never>;
  [PartType.KICKSTAND]: Record<string, never>;
  [PartType.RACK]: Record<string, never>;
  [PartType.BAG_SADDLE]: Record<string, never>;
  [PartType.BAG_FRAME]: Record<string, never>;
  [PartType.BOTTLE_CAGE]: Record<string, never>;
  [PartType.LIGHT_FRONT]: Record<string, never>;
  [PartType.LIGHT_REAR]: Record<string, never>;
  [PartType.BELL]: Record<string, never>;
  [PartType.COMPUTER]: Record<string, never>;
};

export function getDefaultSpecificData(
  type: PartType
): Partial<PartSpecificDataMap[PartType]> {
  const defaults: Partial<Record<PartType, unknown>> = {
    [PartType.FRAME]: { material: "aluminum", brakeType: "disc", wheelSize: "28", frameSize: "m", gender: "men" },
    [PartType.TIRE_FRONT]: { beadType: "folding", tubelessReady: false, hookless: false, treadType: "slick", sizeFormat: "french", sizeFrench: "700 x 28C" },
    [PartType.TIRE_REAR]: { beadType: "folding", tubelessReady: false, hookless: false, treadType: "slick", sizeFormat: "french", sizeFrench: "700 x 28C" },
    [PartType.CHAIN]: { speeds: 11 },
    [PartType.CASSETTE]: { range: "11-34", speeds: 11 },
    [PartType.PADS_FRONT]: { rimBrake: false, material: "organic" },
    [PartType.PADS_REAR]: { rimBrake: false, material: "organic" },
    [PartType.DISC_FRONT]: { discMount: "centerlock", size: "160" },
    [PartType.DISC_REAR]: { discMount: "centerlock", size: "160" },
    [PartType.FORK]: { wheelSize: "28", material: "aluminum" },
    [PartType.SEATPOST]: { material: "aluminum" },
    [PartType.SPOKES]: { material: "stainless-steel" },
    [PartType.RIMS]: { material: "aluminum", rimDepth: 30, internalWidth: 21, hookless: false, tubelessReady: false, brakeType: "disc", wheelSize: "28" },
    [PartType.HUBS]: { discMount: "centerlock", bearings: "cartridge", holes: 32 },
    [PartType.BOTTOM_BRACKET]: { shellType: "bsa" },
    [PartType.CRANKSET]: { chainring: 34, length: "170" },
    [PartType.SUSPENSION_FORK]: { travel: 100 },
    [PartType.TUBELESS_SEALANT]: { volume: 60 },
    [PartType.DROPPER_POST]: { travel: 150 },
    [PartType.SUSPENSION_SEATPOST]: { travel: 50 },
    [PartType.PEDALS]: { clipless: "no", bearings: "cartridge", platform: true, bodyMaterial: "aluminum" },
    [PartType.DERAILLEUR_REAR]: { speeds: 11, derailleurType: "mechanical", drivetrain: "1x11" },
    [PartType.STEM]: { length: 90, angle: 6, material: "aluminum" },
    [PartType.HEADSET]: { bearings: "cartridge" },
    [PartType.HANDLEBAR]: { material: "aluminum", width: 420 },
    [PartType.HANDLEBAR_TAPE]: { material: "eva", thickness: 2.5 },
    [PartType.LUBRICANT]: { lubricantType: "oil" },
    // E-bike
    [PartType.MOTOR]: { power: 250, motorType: "mid-drive" },
    [PartType.BATTERY]: { capacity: 500, voltage: 36 },
    [PartType.CONTROLLER]: {},
  };
  return (defaults[type] || {}) as Partial<PartSpecificDataMap[PartType]>;
}

export function hasSpecificFields(type: PartType): boolean {
  const typesWithFields: PartType[] = [
    PartType.FRAME,
    PartType.TIRE_FRONT,
    PartType.TIRE_REAR,
    PartType.CHAIN,
    PartType.CASSETTE,
    PartType.PADS_FRONT,
    PartType.PADS_REAR,
    PartType.DISC_FRONT,
    PartType.DISC_REAR,
    PartType.FORK,
    PartType.SEATPOST,
    PartType.SPOKES,
    PartType.RIMS,
    PartType.HUBS,
    PartType.BOTTOM_BRACKET,
    PartType.CRANKSET,
    PartType.PEDALS,
    PartType.DERAILLEUR_REAR,
    PartType.STEM,
    PartType.HEADSET,
    PartType.HANDLEBAR,
    PartType.HANDLEBAR_TAPE,
    PartType.SUSPENSION_FORK,
    PartType.TUBELESS_SEALANT,
    PartType.DROPPER_POST,
    PartType.SUSPENSION_SEATPOST,
    PartType.LUBRICANT,
    // E-bike
    PartType.MOTOR,
    PartType.BATTERY,
  ];
  return typesWithFields.includes(type);
}

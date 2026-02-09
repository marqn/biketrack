import { PartType } from "@/lib/generated/prisma";

export type TireSpecificData = {
  width: number; // mm
  size: number; // 700c, 650b, 29
  tubeless: boolean;
};

export type ChainSpecificData = {
  speeds: number; // 10, 11, 12
};

export type CassetteSpecificData = {
  range: string;
  speeds: 1 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
};

export type PadsSpecificData = {
  material: "organic" | "metallic" | "semi-metallic";
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
  gender: "women" | "men";
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
  [PartType.HANDLEBAR_TAPE]: Record<string, never>; // Brak specyficznych pól
  [PartType.LUBRICANT]: LubricantSpecificData;
  // E-bike
  [PartType.MOTOR]: MotorSpecificData;
  [PartType.BATTERY]: BatterySpecificData;
  [PartType.CONTROLLER]: ControllerSpecificData;
};

export function getDefaultSpecificData(
  type: PartType
): Partial<PartSpecificDataMap[PartType]> {
  const defaults: Partial<Record<PartType, unknown>> = {
    [PartType.FRAME]: { material: "aluminum", brakeType: "disc", wheelSize: "28", frameSize: "m", gender: "men" },
    [PartType.TIRE_FRONT]: { width: 28, size: 700, tubeless: false },
    [PartType.TIRE_REAR]: { width: 28, size: 700, tubeless: false },
    [PartType.CHAIN]: { speeds: 11 },
    [PartType.CASSETTE]: { range: "11-34", speeds: 11 },
    [PartType.PADS_FRONT]: { material: "organic" },
    [PartType.PADS_REAR]: { material: "organic" },
    [PartType.FORK]: { wheelSize: "28", material: "aluminum" },
    [PartType.SEATPOST]: { material: "aluminum" },
    [PartType.SPOKES]: { material: "stainless-steel" },
    [PartType.HUBS]: { discMount: "centerlock", bearings: "cartridge", holes: 32 },
    [PartType.BOTTOM_BRACKET]: { shellType: "bsa" },
    [PartType.CRANKSET]: { chainring: 34, length: "170" },
    [PartType.SUSPENSION_FORK]: { travel: 100 },
    [PartType.TUBELESS_SEALANT]: { volume: 60 },
    [PartType.DROPPER_POST]: { travel: 150 },
    [PartType.SUSPENSION_SEATPOST]: { travel: 50 },
    [PartType.HANDLEBAR_TAPE]: {},
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
    PartType.FORK,
    PartType.SEATPOST,
    PartType.SPOKES,
    PartType.HUBS,
    PartType.BOTTOM_BRACKET,
    PartType.CRANKSET,
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

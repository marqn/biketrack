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
  range: string; // "11-34", "10-52"
  speeds: number;
};

export type PadsSpecificData = {
  material: "organic" | "metallic" | "semi-metallic";
};

export type SuspensionSpecificData = {
  travel: number; // mm
};

export type ChainringSpecificData = {
  teeth: number;
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
  [PartType.TIRE_FRONT]: TireSpecificData;
  [PartType.TIRE_REAR]: TireSpecificData;
  [PartType.CHAIN]: ChainSpecificData;
  [PartType.CASSETTE]: CassetteSpecificData;
  [PartType.PADS_FRONT]: PadsSpecificData;
  [PartType.PADS_REAR]: PadsSpecificData;
  [PartType.SUSPENSION_FORK]: SuspensionSpecificData;
  [PartType.CHAINRING_1X]: ChainringSpecificData;
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
    [PartType.TIRE_FRONT]: { width: 28, size: 700, tubeless: false },
    [PartType.TIRE_REAR]: { width: 28, size: 700, tubeless: false },
    [PartType.CHAIN]: { speeds: 11 },
    [PartType.CASSETTE]: { range: "11-34", speeds: 11 },
    [PartType.PADS_FRONT]: { material: "organic" },
    [PartType.PADS_REAR]: { material: "organic" },
    [PartType.SUSPENSION_FORK]: { travel: 100 },
    [PartType.CHAINRING_1X]: { teeth: 32 },
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
    PartType.TIRE_FRONT,
    PartType.TIRE_REAR,
    PartType.CHAIN,
    PartType.CASSETTE,
    PartType.PADS_FRONT,
    PartType.PADS_REAR,
    PartType.SUSPENSION_FORK,
    PartType.CHAINRING_1X,
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

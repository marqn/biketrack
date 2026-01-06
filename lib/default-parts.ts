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

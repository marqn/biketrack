import { NotificationType, PartType } from '@/lib/generated/prisma';
import { BRAKE_FLUID_INTERVAL_DAYS } from "@/lib/default-parts";
import type { BikeWithSyncData, NotifInput } from '../checkBikeNotifications';

export function brakeFluidRule(bike: BikeWithSyncData, existingNotifs: Set<string>): NotifInput[] {
  const part = bike.parts.find(p => p.type === PartType.BRAKE_FLUID);
  if (!part) return [];

  const referenceDate = part.installedAt || part.createdAt;
  const daysSince = (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < BRAKE_FLUID_INTERVAL_DAYS) return [];

  const key = `${NotificationType.SERVICE_DUE}-${bike.id}-${part.id}`;
  if (existingNotifs.has(key)) return [];

  existingNotifs.add(key);
  return [{
    userId: bike.userId,
    type: NotificationType.SERVICE_DUE,
    title: "Wymień płyn hamulcowy",
    message: `Od ostatniej wymiany płynu hamulcowego minęło ${Math.floor(daysSince)} dni.`,
    bikeId: bike.id,
    partId: part.id,
  }];
}

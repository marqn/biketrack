import { NotificationType, ServiceType } from '@/lib/generated/prisma';
import { SEALANT_INTERVAL_DAYS } from "@/lib/default-parts";
import type { BikeWithSyncData, NotifInput } from '../checkBikeNotifications';

export function tubelessSealantRule(bike: BikeWithSyncData, existingNotifs: Set<string>): NotifInput[] {
  const result: NotifInput[] = [];

  const wheels: Array<{ type: ServiceType; label: string }> = [
    { type: ServiceType.SEALANT_FRONT, label: "przednie" },
    { type: ServiceType.SEALANT_REAR, label: "tylne" },
  ];

  for (const wheel of wheels) {
    const lastEvent = bike.services.find(s => s.type === wheel.type);
    if (!lastEvent) continue;

    const daysSince = (Date.now() - lastEvent.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < SEALANT_INTERVAL_DAYS) continue;

    const key = `${NotificationType.SERVICE_DUE}-${bike.id}-null`;
    if (existingNotifs.has(key)) continue;

    result.push({
      userId: bike.userId,
      type: NotificationType.SERVICE_DUE,
      title: `Wymień mleko tubeless (${wheel.label})`,
      message: `Od ostatniej wymiany mleka minęło ${Math.floor(daysSince)} dni.`,
      bikeId: bike.id,
    });
    existingNotifs.add(key);
  }

  return result;
}

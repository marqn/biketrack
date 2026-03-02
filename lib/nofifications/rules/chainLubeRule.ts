import { NotificationType, ServiceType, PartType } from "@/lib/generated/prisma";
import { CHAIN_LUBE_INTERVAL_KM } from "@/lib/default-parts";
import type { BikeWithSyncData, NotifInput } from '../checkBikeNotifications';

export function chainLubeRule(bike: BikeWithSyncData, existingNotifs: Set<string>): NotifInput[] {
  const chainPart = bike.parts.find(p => p.type === PartType.CHAIN);
  if (!chainPart) return [];

  const lastLube = bike.services.find(s => s.type === ServiceType.CHAIN_LUBE);
  const kmSince = bike.totalKm - (lastLube?.kmAtTime ?? 0);

  if (kmSince < CHAIN_LUBE_INTERVAL_KM) return [];

  const key = `${NotificationType.SERVICE_DUE}-${bike.id}-${chainPart.id}`;
  if (existingNotifs.has(key)) return [];

  const bikeName = bike.brand || bike.model
    ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
    : bike.type;

  existingNotifs.add(key);
  return [{
    userId: bike.userId,
    type: NotificationType.SERVICE_DUE,
    title: `Czas nasmarować łańcuch – ${bikeName}`,
    message: `Od ostatniego smarowania minęło ${kmSince} km.`,
    bikeId: bike.id,
    partId: chainPart.id,
  }];
}

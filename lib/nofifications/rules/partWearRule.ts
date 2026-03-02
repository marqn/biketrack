import { NotificationType } from '@/lib/generated/prisma';
import { PART_UI } from '@/lib/default-parts';
import type { BikeWithSyncData, NotifInput } from '../checkBikeNotifications';

export function partWearRule(bike: BikeWithSyncData, existingNotifs: Set<string>): NotifInput[] {
  const result: NotifInput[] = [];
  const bikeName = bike.brand || bike.model
    ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
    : bike.type;

  for (const part of bike.parts) {
    if (!part.isInstalled) continue;
    if (!part.expectedKm || part.expectedKm <= 0) continue;

    const wearPercent = part.wearKm / part.expectedKm;
    const key100 = `${NotificationType.PART_WORN}-${bike.id}-${part.id}`;
    const key80 = `${NotificationType.PART_NEAR_WORN}-${bike.id}-${part.id}`;

    if (wearPercent >= 1 && !existingNotifs.has(key100)) {
      result.push({
        userId: bike.userId,
        type: NotificationType.PART_WORN,
        title: "Zużyty komponent",
        message: `Komponent ${PART_UI[part.type]} w rowerze ${bikeName} przekroczył przewidywany przebieg.`,
        bikeId: bike.id,
        partId: part.id,
      });
      existingNotifs.add(key100);
    } else if (wearPercent >= 0.8 && !existingNotifs.has(key80)) {
      result.push({
        userId: bike.userId,
        type: NotificationType.PART_NEAR_WORN,
        title: "Zbliżające się zużycie",
        message: `Komponent ${PART_UI[part.type]} w rowerze ${bikeName} zbliża się do końca żywotności.`,
        bikeId: bike.id,
        partId: part.id,
      });
      existingNotifs.add(key80);
    }
  }

  return result;
}

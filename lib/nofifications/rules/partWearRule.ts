import {  } from '@prisma/client';
import { ensureNotification } from "../utils/ensureNotification"
import { BikePart, NotificationType } from '@/lib/generated/prisma';
import { PART_UI } from '@/lib/default-parts';

export async function partWearRule(
  part: BikePart & { bike: { userId: string; brand: string | null; model: string | null; type: string } }
) {
  if (!part.expectedKm || part.expectedKm <= 0) return

  const wearPercent = part.wearKm / part.expectedKm
  const bikeName = part.bike.brand || part.bike.model
    ? `${part.bike.brand ?? ""} ${part.bike.model ?? ""}`.trim()
    : part.bike.type

  if (wearPercent >= 1) {
    await ensureNotification({
      userId: part.bike.userId,
      type: NotificationType.PART_WORN,
      title: "Worn component",
      message: `Component ${PART_UI[part.type]} on bike ${bikeName} has exceeded expected mileage.`,
      bikeId: part.bikeId,
      partId: part.id,
    })
  } else if (wearPercent >= 0.8) {
    await ensureNotification({
      userId: part.bike.userId,
      type: NotificationType.PART_NEAR_WORN,
      title: "Approaching wear limit",
      message: `Component ${PART_UI[part.type]} on bike ${bikeName} is approaching end of lifespan.`,
      bikeId: part.bikeId,
      partId: part.id,
    })
  }
}

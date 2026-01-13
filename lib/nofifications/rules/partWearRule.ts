import {  } from '@prisma/client';
import { ensureNotification } from "../utils/ensureNotification"
import { BikePart, NotificationType } from '@/lib/generated/prisma';
import { PART_UI } from '@/lib/default-parts';

export async function partWearRule(
  part: BikePart & { bike: { userId: string; name: string | null } }
) {
  if (!part.expectedKm || part.expectedKm <= 0) return

  const wearPercent = part.wearKm / part.expectedKm

  if (wearPercent >= 1) {
    await ensureNotification({
      userId: part.bike.userId,
      type: NotificationType.PART_WORN,
      title: "Zużyty komponent",
      message: `Komponent ${PART_UI[part.type]} w rowerze ${
        part.bike.name ?? ""
      } przekroczył przewidywany przebieg.`,
      bikeId: part.bikeId,
      partId: part.id,
    })
  } else if (wearPercent >= 0.8) {
    await ensureNotification({
      userId: part.bike.userId,
      type: NotificationType.PART_NEAR_WORN,
      title: "Zbliżające się zużycie",
      message: `Komponent ${PART_UI[part.type]} w rowerze ${
        part.bike.name ?? ""
      } zbliża się do końca żywotności.`,
      bikeId: part.bikeId,
      partId: part.id,
    })
  }
}

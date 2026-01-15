"use server";

import {
  NotificationStatus,
  NotificationType,
  PartType,
  ServiceType,
} from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function addChainLube(bikeId: string) {
  await prisma.$transaction(async (tx) => {
    // 1️⃣ pobierz rower
    const bike = await tx.bike.findUnique({
      where: { id: bikeId },
      select: { totalKm: true },
    });

    if (!bike) return;

    // 2️⃣ pobierz łańcuch
    const chainPart = await tx.bikePart.findFirst({
      where: {
        bikeId,
        type: PartType.CHAIN,
      },
      select: { id: true },
    });

    if (!chainPart) return;

    // 3️⃣ zapisz event
    await tx.serviceEvent.create({
      data: {
        type: ServiceType.CHAIN_LUBE,
        kmAtTime: bike.totalKm,
        bikeId,
      },
    });

    // 4️⃣ zamknij notification
    await tx.notification.updateMany({
      where: {
        partId: chainPart.id,
        status: NotificationStatus.UNREAD,
        type: NotificationType.SERVICE_DUE,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  });

  return true;
}

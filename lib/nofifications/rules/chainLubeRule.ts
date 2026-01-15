import { prisma } from "@/lib/prisma";
import {
  NotificationType,
  ServiceType,
  PartType,
} from "@/lib/generated/prisma";
import { ensureNotification } from "../utils/ensureNotification";
import { CHAIN_LUBE_INTERVAL_KM } from "@/lib/default-parts";

export async function chainLubeRule(bikeId: string) {
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    include: {
      services: {
        where: { type: ServiceType.CHAIN_LUBE },
        orderBy: { kmAtTime: "desc" },
        take: 1,
      },
      user: true,
    },
  });

  if (!bike) return;

  const lastLube = bike.services[0] ?? { kmAtTime: 0 };
  const kmSince = bike.totalKm - lastLube.kmAtTime;

  if (kmSince < CHAIN_LUBE_INTERVAL_KM) return;

  const chainPart = await prisma.bikePart.findFirst({
    where: {
      bikeId,
      type: PartType.CHAIN,
    },
  });

  if (!chainPart) return; // brak łańcucha = brak alertu

  await ensureNotification({
    userId: bike.userId,
    type: NotificationType.SERVICE_DUE,
    title: "Czas nasmarować łańcuch",
    message: `Od ostatniego smarowania minęło ${kmSince} km.`,
    bikeId: bike.id,
    partId: chainPart.id, // ✅
  });
}

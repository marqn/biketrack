import { prisma } from "@/lib/prisma"
import { NotificationType, ServiceType } from '@/lib/generated/prisma';
import { ensureNotification } from "../utils/ensureNotification"
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
  })

  if (!bike) return

  const lastLube = bike.services[0]
  if (!lastLube) return

  const kmSince = bike.totalKm - lastLube.kmAtTime
  if (kmSince < CHAIN_LUBE_INTERVAL_KM) return

  await ensureNotification({
    userId: bike.userId,
    type: NotificationType.SERVICE_DUE,
    title: "Czas nasmarować łańcuch",
    message: `Od ostatniego smarowania minęło ${kmSince} km.`,
    bikeId: bike.id,
  })
}

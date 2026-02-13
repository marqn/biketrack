import { prisma } from "@/lib/prisma"
import { NotificationType, PartType } from '@/lib/generated/prisma';
import { ensureNotification } from "../utils/ensureNotification"
import { SEALANT_INTERVAL_DAYS } from "@/lib/default-parts";

export async function tubelessSealantRule(bikeId: string) {
  const parts = await prisma.bikePart.findMany({
    where: {
      bikeId,
      type: { in: [PartType.TUBELESS_SEALANT_FRONT, PartType.TUBELESS_SEALANT_REAR] },
    },
    include: {
      bike: {
        select: {
          userId: true,
        },
      },
    },
  })

  for (const part of parts) {
    const referenceDate = part.installedAt || part.createdAt
    const daysSince =
      (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince < SEALANT_INTERVAL_DAYS) continue

    const label = part.type === PartType.TUBELESS_SEALANT_FRONT ? "przednie" : "tylne"

    await ensureNotification({
      userId: part.bike.userId,
      type: NotificationType.SERVICE_DUE,
      title: `Wymień mleko tubeless (${label})`,
      message: `Od ostatniej wymiany mleka minęło ${Math.floor(
        daysSince
      )} dni.`,
      bikeId,
      partId: part.id,
    })
  }
}

import { prisma } from "@/lib/prisma"
import { NotificationType, PartType } from '@/lib/generated/prisma';
import { ensureNotification } from "../utils/ensureNotification"
import { SEALANT_INTERVAL_DAYS } from "@/lib/default-parts";

export async function tubelessSealantRule(bikeId: string) {
  const part = await prisma.bikePart.findFirst({
    where: {
      bikeId,
      type: PartType.TUBELESS_SEALANT,
    },
    include: {
      bike: {
        select: {
          userId: true,
        },
      },
    },
  })

  if (!part) return

  const referenceDate = part.installedAt || part.createdAt
  const daysSince =
    (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSince < SEALANT_INTERVAL_DAYS) return

  await ensureNotification({
    userId: part.bike.userId,
    type: NotificationType.SERVICE_DUE,
    title: "Wymień mleko tubeless",
    message: `Od ostatniej wymiany mleka minęło ${Math.floor(
      daysSince
    )} dni.`,
    bikeId,
    partId: part.id,
  })
}

import { prisma } from "@/lib/prisma"
import { partWearRule } from "./rules/partWearRule"

export async function checkBikeNotifications(bikeId: string) {
  const parts = await prisma.bikePart.findMany({
    where: { bikeId },
    include: {
      bike: {
        select: {
          userId: true,
          name: true,
        },
      },
    },
  })

  for (const part of parts) {
    await partWearRule(part)
  }
}

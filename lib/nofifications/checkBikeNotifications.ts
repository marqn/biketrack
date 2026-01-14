import { prisma } from "@/lib/prisma";
import { partWearRule } from "./rules/partWearRule";
import { chainLubeRule } from "./rules/chainLubeRule";
import { tubelessSealantRule } from "./rules/tubelessSealantRule";

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
  });

  for (const part of parts) {
    await partWearRule(part);
  }
  await chainLubeRule(bikeId);
  await tubelessSealantRule(bikeId);
}

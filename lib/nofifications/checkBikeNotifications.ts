import { prisma } from "@/lib/prisma";
import { partWearRule } from "./rules/partWearRule";
import { chainLubeRule } from "./rules/chainLubeRule";
import { tubelessSealantRule } from "./rules/tubelessSealantRule";
import { brakeFluidRule } from "./rules/brakeFluidRule";

export async function checkBikeNotifications(bikeId: string) {
  const parts = await prisma.bikePart.findMany({
    where: { bikeId },
    include: {
      bike: {
        select: {
          userId: true,
          brand: true,
          model: true,
          type: true,
        },
      },
    },
  });

  for (const part of parts) {
    await partWearRule(part);
  }
  await chainLubeRule(bikeId);
  await tubelessSealantRule(bikeId);
  await brakeFluidRule(bikeId);
}

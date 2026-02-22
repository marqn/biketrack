"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { PartType } from "@/lib/generated/prisma";
import { getDefaultSpecificData } from "@/lib/part-specific-data";
import type { BrakeType, ForkType } from "@/lib/default-parts";

interface UpdateBikeSetupParams {
  bikeId: string;
  brakeType: BrakeType;
  forkType: ForkType;
  tubelessFront: boolean;
  tubelessRear: boolean;
}

export async function updateBikeSetup({
  bikeId,
  brakeType,
  forkType,
  tubelessFront,
  tubelessRear,
}: UpdateBikeSetupParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { id: true, userId: true },
  });

  if (!bike) return { success: false, error: "Rower nie został znaleziony" };
  if (bike.userId !== session.user.id) return { success: false, error: "Brak uprawnień" };

  const parts = await prisma.bikePart.findMany({
    where: {
      bikeId,
      type: { in: [PartType.FRAME, PartType.TIRE_FRONT, PartType.TIRE_REAR] },
    },
    select: { id: true, type: true, partSpecificData: true },
  });

  await prisma.$transaction(
    parts.map((part) => {
      if (part.type === PartType.FRAME) {
        const current = (part.partSpecificData as Record<string, unknown>) ?? getDefaultSpecificData(PartType.FRAME);
        return prisma.bikePart.update({
          where: { id: part.id },
          data: { partSpecificData: { ...current, brakeType, forkType } },
        });
      }
      if (part.type === PartType.TIRE_FRONT) {
        const current = (part.partSpecificData as Record<string, unknown>) ?? getDefaultSpecificData(PartType.TIRE_FRONT);
        return prisma.bikePart.update({
          where: { id: part.id },
          data: { partSpecificData: { ...current, tubelessReady: tubelessFront } },
        });
      }
      // TIRE_REAR
      const current = (part.partSpecificData as Record<string, unknown>) ?? getDefaultSpecificData(PartType.TIRE_REAR);
      return prisma.bikePart.update({
        where: { id: part.id },
        data: { partSpecificData: { ...current, tubelessReady: tubelessRear } },
      });
    })
  );

  revalidatePath("/app");
  return { success: true };
}

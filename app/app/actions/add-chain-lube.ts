"use server";

import { ServiceType } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function addChainLube(bikeId: string) {
  // 🔹 tylko dodaj event, nie zmieniaj wearKm
  await prisma.serviceEvent.create({
    data: {
      type: ServiceType.CHAIN_LUBE,
      kmAtTime: (
        await prisma.bike.findUnique({ where: { id: bikeId } })
      )!.totalKm,
      bikeId,
    },
  });

  // 🔹 nic nie resetujemy
  return true;
}

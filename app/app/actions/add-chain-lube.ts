"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  bikeId: z.string().cuid(),
});

export async function addChainLube(formData: FormData) {
  const parsed = schema.safeParse({
    bikeId: formData.get("bikeId"),
  });

  if (!parsed.success) {
    return { error: "Nieprawidłowe ID roweru" };
  }

  const { bikeId } = parsed.data;

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { totalKm: true },
  });

  if (!bike) return { error: "Brak roweru" };

  await prisma.serviceEvent.create({
    data: {
      bikeId,
      type: "CHAIN_LUBE",
      kmAtTime: bike.totalKm,
    },
  });

  return { success: true, kmAtTime: bike.totalKm };
}

"use server";

import { checkBikeNotifications } from "@/lib/nofifications/checkBikeNotifications";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  bikeId: z.string().cuid(),
  newKm: z.coerce.number().int().min(0).max(1_000_000),
});

export async function updateBikeKm(formData: FormData) {
  const parsed = schema.safeParse({
    bikeId: formData.get("bikeId"),
    newKm: formData.get("newKm"),
  });

  if (!parsed.success) {
    throw new Error("Nieprawidłowe dane");
  }

  const { bikeId, newKm } = parsed.data;

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    include: { parts: true },
  });

  if (!bike) throw new Error("Bike not found");

  const diffKm = newKm - bike.totalKm;
  if (diffKm <= 0) return;

  await prisma.$transaction([
    prisma.bike.update({
      where: { id: bikeId },
      data: { totalKm: newKm },
    }),

    prisma.bikePart.updateMany({
      where: { bikeId, isInstalled: true },
      data: {
        wearKm: { increment: diffKm },
      },
    }),
  ]);

  await checkBikeNotifications(bikeId); // Przekaż prisma

  revalidatePath("/app");
}

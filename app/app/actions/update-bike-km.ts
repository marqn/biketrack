"use server";

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
    return { error: "Nieprawidłowe kilometry" };
  }

  const { bikeId, newKm } = parsed.data;

  await prisma.bike.update({
    where: { id: bikeId },
    data: { totalKm: newKm },
  });

  revalidatePath("/app");

  return { success: true, newKm };
}

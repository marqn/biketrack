"use server";

import { PartType } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  bikeId: z.string().cuid(),
  partType: z.nativeEnum(PartType),
});

export async function replacePart(formData: FormData) {
  const parsed = schema.safeParse({
    bikeId: formData.get("bikeId"),
    partType: formData.get("partType"),
  });

  if (!parsed.success) throw new Error("Nieprawidłowe dane");

  const { bikeId, partType } = parsed.data;

  // Resetujemy wearKm tylko dla podanej części
  await prisma.bikePart.updateMany({
    where: { bikeId, type: partType },
    data: { wearKm: 0 },
  });

  // Odświeżenie strony
  revalidatePath("/app");

  return { success: true };
}

// nie aktualizuje się wearKm w BikePart
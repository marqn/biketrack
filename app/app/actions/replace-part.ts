"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PartType, Prisma } from "@/lib/generated/prisma";

export async function replacePart(formData: FormData) {
  const bikeId = formData.get("bikeId") as string;
  const partType = formData.get("partType") as PartType;
  const brand = formData.get("brand") as string | null;
  const model = formData.get("model") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!bikeId || !partType) {
    throw new Error("Brak wymaganych danych");
  }

  // Pobierz aktualny stan roweru i części
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    include: {
      parts: {
        where: { type: partType },
        include: { product: true }, // Include product dla snapshot
      },
    },
  });

  if (!bike || bike.parts.length === 0) {
    throw new Error("Nie znaleziono roweru lub części");
  }

  const part = bike.parts[0];

  // Zapisz historię wymiany (snapshot produktu)
  await prisma.partReplacement.create({
    data: {
      bikeId,
      partId: part.id,
      partType,
      productId: part.productId,
      brand: part.product?.brand || brand?.trim() || null,
      model: part.product?.model || model?.trim() || null,
      notes: notes?.trim() || null,
      kmAtReplacement: bike.totalKm,
      kmUsed: part.wearKm,
    },
  });

  // Reset BikePart (nowa część = czyste dane)
  await prisma.bikePart.update({
    where: { id: part.id },
    data: {
      wearKm: 0,
      productId: null,
      installedAt: null,
      partSpecificData: Prisma.JsonNull,
    },
  });

  revalidatePath("/app"); // 👈 DODANE - główna strona
  revalidatePath(`/app/bikes/${bikeId}`);
}

export async function deletePartReplacement(replacementId: string) {
  const replacement = await prisma.partReplacement.findUnique({
    where: { id: replacementId },
    select: {
      partId: true,
      kmUsed: true,
      bikeId: true,
    },
  });

  if (!replacement) {
    throw new Error("Nie znaleziono wpisu wymiany");
  }

  await prisma.$transaction([
    prisma.bikePart.update({
      where: { id: replacement.partId },
      data: {
        wearKm: {
          increment: replacement.kmUsed,
        },
      },
    }),
    prisma.partReplacement.delete({
      where: { id: replacementId },
    }),
  ]);

  revalidatePath("/app"); // 👈 DODANE
  revalidatePath(`/app/bikes/${replacement.bikeId}`);
  revalidatePath("/app/bikes");
}

export async function updatePartReplacement(
  replacementId: string,
  data: {
    brand?: string;
    model?: string;
    notes?: string;
  }
) {
  const replacement = await prisma.partReplacement.update({
    where: { id: replacementId },
    data: {
      brand: data.brand?.trim() || null,
      model: data.model?.trim() || null,
      notes: data.notes?.trim() || null,
    },
    select: { bikeId: true }, // 👈 DODANE - pobierz bikeId
  });

  revalidatePath("/app"); // 👈 DODANE
  revalidatePath(`/app/bikes/${replacement.bikeId}`); // 👈 DODANE
  revalidatePath("/app/bikes");
}
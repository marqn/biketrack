"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PartType } from "@/lib/generated/prisma";

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
      },
    },
  });

  if (!bike || bike.parts.length === 0) {
    throw new Error("Nie znaleziono roweru lub części");
  }

  const part = bike.parts[0];

  // Zapisz historię wymiany
  await prisma.partReplacement.create({
    data: {
      bikeId,
      partId: part.id,
      partType,
      brand: brand?.trim() || null,
      model: model?.trim() || null,
      notes: notes?.trim() || null,
      kmAtReplacement: bike.totalKm,
      kmUsed: part.wearKm,
    },
  });

  // Zresetuj licznik zużycia części
  await prisma.bikePart.update({
    where: { id: part.id },
    data: { wearKm: 0 },
  });

  revalidatePath(`/app/bikes/${bikeId}`);
}

export async function deletePartReplacement(replacementId: string) {
  // Pobierz szczegóły wymiany przed usunięciem
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

  // Użyj transakcji aby zapewnić atomowość operacji
  await prisma.$transaction([
    // Przywróć km do części
    prisma.bikePart.update({
      where: { id: replacement.partId },
      data: {
        wearKm: {
          increment: replacement.kmUsed,
        },
      },
    }),
    // Usuń wpis wymiany
    prisma.partReplacement.delete({
      where: { id: replacementId },
    }),
  ]);

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
  await prisma.partReplacement.update({
    where: { id: replacementId },
    data: {
      brand: data.brand?.trim() || null,
      model: data.model?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath("/app/bikes");
}
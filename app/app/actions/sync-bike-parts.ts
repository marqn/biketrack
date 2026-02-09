"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DEFAULT_PARTS, getPartCategory } from "@/lib/default-parts";
import { BikeType, PartType } from "@/lib/generated/prisma";

/**
 * Synchronizuje części roweru z aktualnymi DEFAULT_PARTS.
 * Dodaje brakujące części i usuwa te, które nie są już w konfiguracji.
 */
export async function syncBikeParts(bikeId: string) {
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    include: { parts: true },
  });

  if (!bike) throw new Error("Bike not found");

  const defaultParts = DEFAULT_PARTS[bike.type as BikeType];
  if (!defaultParts) throw new Error("Unknown bike type");

  // Pobierz typy części które powinny być na rowerze
  const expectedPartTypes = new Set(defaultParts.map((p) => p.type));

  // Pobierz typy części które są aktualnie na rowerze
  const existingPartTypes = new Set(bike.parts.map((p) => p.type));

  // Znajdź brakujące części (są w DEFAULT_PARTS ale nie ma ich na rowerze)
  const missingParts = defaultParts.filter((p) => !existingPartTypes.has(p.type));

  // Znajdź nadmiarowe części (są na rowerze ale nie ma ich w DEFAULT_PARTS)
  const extraPartTypes = bike.parts
    .filter((p) => !expectedPartTypes.has(p.type))
    .map((p) => p.type);

  let addedCount = 0;
  let removedCount = 0;

  // Dodaj brakujące części z przebiegiem równym aktualnemu przebiegowi roweru
  // (zakładamy że te części były od początku)
  if (missingParts.length > 0) {
    await prisma.bikePart.createMany({
      data: missingParts.map((p) => ({
        bikeId: bike.id,
        type: p.type,
        expectedKm: p.expectedKm,
        wearKm: bike.totalKm,
        isInstalled: getPartCategory(p.type) !== "accessories",
      })),
    });
    addedCount = missingParts.length;
  }

  // Opcjonalnie: usuń nadmiarowe części (zakomentowane - może być niebezpieczne)
  // if (extraPartTypes.length > 0) {
  //   await prisma.bikePart.deleteMany({
  //     where: {
  //       bikeId: bike.id,
  //       type: { in: extraPartTypes },
  //     },
  //   });
  //   removedCount = extraPartTypes.length;
  // }

  revalidatePath("/app");

  return {
    added: addedCount,
    removed: removedCount,
    missingParts: missingParts.map((p) => p.type),
    extraParts: extraPartTypes,
  };
}

/**
 * Synchronizuje części dla wszystkich rowerów użytkownika
 */
export async function syncAllUserBikes(userId: string) {
  const bikes = await prisma.bike.findMany({
    where: { userId },
    select: { id: true },
  });

  const results = [];
  for (const bike of bikes) {
    const result = await syncBikeParts(bike.id);
    results.push({ bikeId: bike.id, ...result });
  }

  return results;
}

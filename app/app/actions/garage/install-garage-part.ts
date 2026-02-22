"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";

export async function installGaragePart(storedPartId: string, bikeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Brak autoryzacji");

  // Pobierz część z garażu (weryfikacja właściciela)
  const storedPart = await prisma.storedPart.findUnique({
    where: { id: storedPartId },
  });
  if (!storedPart || storedPart.userId !== session.user.id) {
    throw new Error("Nie znaleziono części w garażu");
  }

  // Pobierz rower i aktualną część tego typu
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    include: {
      parts: {
        where: { type: storedPart.partType },
        include: { product: true },
      },
    },
  });
  if (!bike || bike.userId !== session.user.id) {
    throw new Error("Nie znaleziono roweru");
  }
  if (bike.parts.length === 0) {
    throw new Error("Brak slotu dla tego typu części w rowerze");
  }

  const currentPart = bike.parts[0];

  // Zaktualizuj istniejący PartReplacement obecnej części (lub utwórz nowy) — identycznie jak installPart replace
  if (currentPart.productId || currentPart.wearKm > 0 || currentPart.installedAt) {
    const existingReplacement = await prisma.partReplacement.findFirst({
      where: { partId: currentPart.id },
      orderBy: { createdAt: "desc" },
    });

    if (existingReplacement) {
      await prisma.partReplacement.update({
        where: { id: existingReplacement.id },
        data: {
          kmAtReplacement: bike.totalKm,
          kmUsed: currentPart.wearKm,
        },
      });
    } else {
      await prisma.partReplacement.create({
        data: {
          bikeId,
          partId: currentPart.id,
          partType: storedPart.partType,
          productId: currentPart.productId,
          brand: currentPart.product?.brand || null,
          model: currentPart.product?.model || null,
          notes: null,
          kmAtReplacement: bike.totalKm,
          kmUsed: currentPart.wearKm,
        },
      });
    }

    // Przenieś obecną część do garażu
    await prisma.storedPart.create({
      data: {
        userId: session.user.id,
        partType: storedPart.partType,
        brand: currentPart.product?.brand || null,
        model: currentPart.product?.model || null,
        wearKm: currentPart.wearKm,
        expectedKm: currentPart.expectedKm,
        productId: currentPart.productId,
        partSpecificData: currentPart.partSpecificData ?? Prisma.JsonNull,
        fromBikeId: bikeId,
        removedAt: new Date(),
      },
    });
  }

  // Utwórz rekord PartReplacement dla nowo instalowanej części z garażu
  await prisma.partReplacement.create({
    data: {
      bikeId,
      partId: currentPart.id,
      partType: storedPart.partType,
      productId: storedPart.productId,
      brand: storedPart.brand,
      model: storedPart.model,
      notes: null,
      kmAtReplacement: bike.totalKm,
      kmUsed: 0,
    },
  });

  // Zainstaluj część z garażu na rower
  await prisma.bikePart.update({
    where: { id: currentPart.id },
    data: {
      productId: storedPart.productId,
      wearKm: storedPart.wearKm,
      expectedKm: storedPart.expectedKm,
      installedAt: new Date(),
      partSpecificData: storedPart.partSpecificData ?? Prisma.JsonNull,
    },
  });

  // Usuń część z garażu
  await prisma.storedPart.delete({ where: { id: storedPartId } });

  revalidatePath("/app");
  revalidatePath(`/app/garage`);
  revalidatePath(`/app/bikes/${bikeId}`);
}

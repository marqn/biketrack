"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

async function verifyBikeOwnership(bikeId: string, userId: string) {
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { userId: true },
  });
  if (!bike || bike.userId !== userId) throw new Error("Unauthorized");
}

async function verifyCustomPartOwnership(partId: string, userId: string) {
  const part = await prisma.customPart.findUnique({
    where: { id: partId },
    include: { bike: { select: { userId: true } } },
  });
  if (!part || part.bike.userId !== userId) throw new Error("Unauthorized");
  return part;
}

export async function createCustomPart(
  bikeId: string,
  name: string,
  category: string,
  expectedKm?: number,
) {
  const userId = await getSessionUserId();
  await verifyBikeOwnership(bikeId, userId);

  if (!name.trim()) throw new Error("Nazwa jest wymagana");

  const validCategories = ["frame", "drivetrain", "brakes", "wheels", "cockpit", "accessories"];
  if (!validCategories.includes(category)) throw new Error("Nieprawidłowa kategoria");

  await prisma.customPart.create({
    data: {
      bikeId,
      name: name.trim(),
      category,
      expectedKm: expectedKm && expectedKm > 0 ? expectedKm : 0,
    },
  });

  revalidatePath("/app");
}

export async function updateCustomPart(
  partId: string,
  data: {
    brand?: string;
    model?: string;
    installedAt?: Date;
  },
) {
  const userId = await getSessionUserId();
  await verifyCustomPartOwnership(partId, userId);

  await prisma.customPart.update({
    where: { id: partId },
    data: {
      brand: data.brand?.trim() || null,
      model: data.model?.trim() || null,
      installedAt: data.installedAt || null,
    },
  });

  revalidatePath("/app");
}

export async function updateCustomPartWear(
  partId: string,
  wearKm: number,
  expectedKm: number,
) {
  const userId = await getSessionUserId();
  const part = await verifyCustomPartOwnership(partId, userId);

  await prisma.customPart.update({
    where: { id: partId },
    data: {
      wearKm: Math.max(0, Math.round(wearKm)),
      expectedKm: Math.max(0, Math.round(expectedKm)),
    },
  });

  revalidatePath("/app");
  revalidatePath(`/app/bikes/${part.bikeId}`);
}

export async function replaceCustomPart(
  partId: string,
  newData: { brand?: string; model?: string; installedAt?: Date },
) {
  const userId = await getSessionUserId();
  const part = await verifyCustomPartOwnership(partId, userId);

  // Zapisz starą część do garażu
  await prisma.customStoredPart.create({
    data: {
      userId,
      name: part.name,
      category: part.category,
      brand: part.brand,
      model: part.model,
      wearKm: part.wearKm,
      expectedKm: part.expectedKm,
      installedAt: part.installedAt,
      fromBikeId: part.bikeId,
      fromCustomPartId: partId,
      removedAt: new Date(),
    },
  });

  // Zresetuj część z nowymi danymi
  await prisma.customPart.update({
    where: { id: partId },
    data: {
      wearKm: 0,
      brand: newData.brand?.trim() || null,
      model: newData.model?.trim() || null,
      installedAt: newData.installedAt || null,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/garage");
}

export async function updateCustomStoredPart(
  storedPartId: string,
  data: { brand?: string; model?: string; notes?: string },
) {
  const userId = await getSessionUserId();
  const part = await prisma.customStoredPart.findUnique({
    where: { id: storedPartId },
    select: { userId: true },
  });
  if (!part || part.userId !== userId) throw new Error("Unauthorized");

  await prisma.customStoredPart.update({
    where: { id: storedPartId },
    data: {
      brand: data.brand?.trim() || null,
      model: data.model?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath("/app/history");
  revalidatePath("/app/garage");
}

export async function getCustomPartHistory(customPartId: string) {
  const userId = await getSessionUserId();
  await verifyCustomPartOwnership(customPartId, userId);

  return prisma.customStoredPart.findMany({
    where: { fromCustomPartId: customPartId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      brand: true,
      model: true,
      wearKm: true,
      expectedKm: true,
      installedAt: true,
      removedAt: true,
      createdAt: true,
    },
  });
}

export async function deleteCustomStoredPart(storedPartId: string) {
  const userId = await getSessionUserId();
  const part = await prisma.customStoredPart.findUnique({
    where: { id: storedPartId },
    select: { userId: true },
  });
  if (!part || part.userId !== userId) throw new Error("Unauthorized");

  await prisma.customStoredPart.delete({ where: { id: storedPartId } });
  revalidatePath("/app/garage");
}

export async function deleteCustomPart(partId: string) {
  const userId = await getSessionUserId();
  await verifyCustomPartOwnership(partId, userId);

  await prisma.customPart.delete({
    where: { id: partId },
  });

  revalidatePath("/app");
}

export async function installCustomGaragePart(storedPartId: string, bikeId: string) {
  const userId = await getSessionUserId();

  const storedPart = await prisma.customStoredPart.findUnique({
    where: { id: storedPartId },
  });
  if (!storedPart || storedPart.userId !== userId) throw new Error("Nie znaleziono części w garażu");

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { userId: true },
  });
  if (!bike || bike.userId !== userId) throw new Error("Nie znaleziono roweru");

  // Jeśli mamy link do oryginalnej CustomPart i jest ona na wybranym rowerze,
  // podmień jej dane zamiast tworzyć nową (unikamy duplikatów).
  if (storedPart.fromCustomPartId) {
    const originalPart = await prisma.customPart.findUnique({
      where: { id: storedPart.fromCustomPartId },
    });

    if (originalPart && originalPart.bikeId === bikeId) {
      // Zapisz aktualny stan oryginalnej części do historii (inGarage=true → trafi do garażu)
      await prisma.customStoredPart.create({
        data: {
          userId,
          name: originalPart.name,
          category: originalPart.category,
          brand: originalPart.brand,
          model: originalPart.model,
          wearKm: originalPart.wearKm,
          expectedKm: originalPart.expectedKm,
          installedAt: originalPart.installedAt,
          fromBikeId: bikeId,
          fromCustomPartId: originalPart.id,
          removedAt: new Date(),
          inGarage: true,
        },
      });

      // Zaktualizuj oryginalną część danymi z garażu
      await prisma.customPart.update({
        where: { id: originalPart.id },
        data: {
          brand: storedPart.brand,
          model: storedPart.model,
          wearKm: storedPart.wearKm,
          expectedKm: storedPart.expectedKm,
          installedAt: new Date(),
        },
      });

      // Wyciągnięta część przestaje być w garażu, ale zostaje w historii
      await prisma.customStoredPart.update({
        where: { id: storedPartId },
        data: { inGarage: false },
      });

      revalidatePath("/app");
      revalidatePath("/app/garage");
      return;
    }
  }

  // Brak linku lub oryginalna część jest na innym rowerze — utwórz nową
  await prisma.customPart.create({
    data: {
      bikeId,
      name: storedPart.name,
      category: storedPart.category,
      brand: storedPart.brand,
      model: storedPart.model,
      wearKm: storedPart.wearKm,
      expectedKm: storedPart.expectedKm,
      installedAt: new Date(),
    },
  });

  // Wyciągnięta część przestaje być w garażu, ale zostaje w historii
  await prisma.customStoredPart.update({
    where: { id: storedPartId },
    data: { inGarage: false },
  });

  revalidatePath("/app");
  revalidatePath("/app/garage");
}

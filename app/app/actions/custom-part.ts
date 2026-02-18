"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

export async function replaceCustomPart(partId: string) {
  const userId = await getSessionUserId();
  await verifyCustomPartOwnership(partId, userId);

  await prisma.customPart.update({
    where: { id: partId },
    data: {
      wearKm: 0,
      brand: null,
      model: null,
      installedAt: null,
    },
  });

  revalidatePath("/app");
}

export async function deleteCustomPart(partId: string) {
  const userId = await getSessionUserId();
  await verifyCustomPartOwnership(partId, userId);

  await prisma.customPart.delete({
    where: { id: partId },
  });

  revalidatePath("/app");
}

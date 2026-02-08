"use server";

import { prisma } from "@/lib/prisma";

export async function canViewBike(bikeId: string, userId?: string): Promise<boolean> {
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { isPublic: true, userId: true },
  });

  if (!bike) return false;
  if (bike.isPublic) return true;
  if (userId && bike.userId === userId) return true;
  return false;
}

export async function isOwner(bikeId: string, userId: string): Promise<boolean> {
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { userId: true },
  });

  return bike?.userId === userId;
}

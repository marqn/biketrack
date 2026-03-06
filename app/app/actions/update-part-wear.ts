"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePartWear(
  partId: string,
  wearKm: number,
  expectedKm: number,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const part = await prisma.bikePart.findUnique({
    where: { id: partId },
    include: { bike: true },
  });

  if (!part) throw new Error("Nie znaleziono części");
  if (part.bike.userId !== session.user.id) throw new Error("Brak dostępu");

  await prisma.bikePart.update({
    where: { id: partId },
    data: {
      wearKm: Math.max(0, Math.round(wearKm)),
      expectedKm: Math.max(0, Math.round(expectedKm)),
    },
  });

  revalidatePath("/app");
  revalidatePath(`/app/bikes/${part.bikeId}`);
}

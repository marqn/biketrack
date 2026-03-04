"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { MaintenanceType } from "@/lib/maintenance-config";

export async function updateMaintenanceInterval(
  bikeId: string,
  type: MaintenanceType,
  intervalKm: number | null,
  intervalDays: number | null
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Brak autoryzacji" };

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { userId: true, maintenanceIntervals: true },
  });

  if (!bike) return { success: false, error: "Nie znaleziono roweru" };
  if (bike.userId !== session.user.id) return { success: false, error: "Brak uprawnień" };

  const current = (bike.maintenanceIntervals as Record<string, { intervalKm?: number; intervalDays?: number }>) ?? {};

  const updated = { ...current };
  if (intervalKm === null && intervalDays === null) {
    delete updated[type];
  } else {
    updated[type] = {
      ...(intervalKm != null ? { intervalKm } : {}),
      ...(intervalDays != null ? { intervalDays } : {}),
    };
  }

  await prisma.bike.update({
    where: { id: bikeId },
    data: { maintenanceIntervals: updated },
  });

  revalidatePath("/app");
  return { success: true };
}

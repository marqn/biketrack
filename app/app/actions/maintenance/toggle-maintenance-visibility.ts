"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { revalidatePath } from "next/cache";
import type { MaintenanceType } from "@/lib/maintenance-config";

export async function toggleMaintenanceVisibility(
  bikeId: string,
  type: MaintenanceType,
  hidden: boolean
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
      select: { userId: true, hiddenMaintenanceItems: true },
    });

    if (!bike) {
      return { success: false, error: "Rower nie został znaleziony" };
    }

    if (bike.userId !== session.user.id) {
      return { success: false, error: "Brak uprawnień" };
    }

    const current = bike.hiddenMaintenanceItems as string[];
    const updated = hidden
      ? [...new Set([...current, type])]
      : current.filter((t) => t !== type);

    await prisma.bike.update({
      where: { id: bikeId },
      data: { hiddenMaintenanceItems: updated },
    });

    revalidatePath("/app");

    return { success: true };
  } catch (error) {
    console.error("Error toggling maintenance visibility:", error);
    return { success: false, error: "Wystąpił błąd" };
  }
}

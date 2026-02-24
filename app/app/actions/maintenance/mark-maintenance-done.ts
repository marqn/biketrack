"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { MaintenanceType } from "@/lib/generated/prisma";

export async function markMaintenanceDone(bikeId: string, type: MaintenanceType) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
      select: { userId: true, totalKm: true },
    });

    if (!bike) {
      return { success: false, error: "Rower nie został znaleziony" };
    }

    if (bike.userId !== session.user.id) {
      return { success: false, error: "Brak uprawnień" };
    }

    const log = await prisma.maintenanceLog.create({
      data: {
        bikeId,
        type,
        kmAtTime: bike.totalKm,
      },
    });

    revalidatePath("/app");

    return { success: true, log };
  } catch (error) {
    console.error("Error marking maintenance done:", error);
    return { success: false, error: "Wystąpił błąd" };
  }
}

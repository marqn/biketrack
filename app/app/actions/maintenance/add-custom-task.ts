"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function addCustomTask(
  bikeId: string,
  name: string,
  icon: string,
  intervalKm: number | null,
  intervalDays: number | null
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Brak autoryzacji");

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { userId: true },
  });
  if (!bike || bike.userId !== session.user.id) throw new Error("Brak dostępu");

  await prisma.customMaintenanceTask.create({
    data: {
      bikeId,
      name: name.trim(),
      icon,
      intervalKm: intervalKm && intervalKm > 0 ? intervalKm : null,
      intervalDays: intervalDays && intervalDays > 0 ? intervalDays : null,
    },
  });

  revalidatePath("/app");
}

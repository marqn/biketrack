"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function markCustomTaskDone(taskId: string, bikeId: string, kmAtTime: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Brak autoryzacji");

  const task = await prisma.customMaintenanceTask.findUnique({
    where: { id: taskId },
    include: { bike: { select: { userId: true } } },
  });
  if (!task || task.bike.userId !== session.user.id) throw new Error("Brak dostępu");

  await prisma.customMaintenanceLog.create({
    data: { taskId, bikeId, kmAtTime },
  });

  revalidatePath("/app");
}

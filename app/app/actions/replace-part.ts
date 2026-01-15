"use server";

import {
  NotificationStatus,
  PartType,
  NotificationType,
} from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  bikeId: z.string().cuid(),
  partType: z.nativeEnum(PartType),
});

export async function replacePart(formData: FormData) {
  const parsed = schema.safeParse({
    bikeId: formData.get("bikeId"),
    partType: formData.get("partType"),
  });

  if (!parsed.success) throw new Error("Nieprawidłowe dane");

  const { bikeId, partType } = parsed.data;

  await prisma.$transaction(async (tx) => {
    // 1️⃣ znajdź części
    const parts = await tx.bikePart.findMany({
      where: {
        bikeId,
        type: partType,
      },
      select: { id: true },
    });

    const partIds = parts.map((p) => p.id);

    // 2️⃣ reset części
    await tx.bikePart.updateMany({
      where: {
        id: { in: partIds },
      },
      data: {
        wearKm: 0,
        createdAt: new Date(),
      },
    });

    // 3️⃣ zamknij notification
    await tx.notification.updateMany({
      where: {
        partId: { in: partIds },
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  });

  revalidatePath("/app");
}

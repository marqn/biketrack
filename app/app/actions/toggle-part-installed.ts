"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function togglePartInstalled(partId: string, isInstalled: boolean) {
  await prisma.bikePart.update({
    where: { id: partId },
    data: { isInstalled },
  });

  revalidatePath("/app");
}

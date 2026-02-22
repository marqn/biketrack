"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function deleteStoredPart(storedPartId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Brak autoryzacji");

  const storedPart = await prisma.storedPart.findUnique({
    where: { id: storedPartId },
    select: { userId: true },
  });
  if (!storedPart || storedPart.userId !== session.user.id) {
    throw new Error("Nie znaleziono części");
  }

  await prisma.storedPart.delete({ where: { id: storedPartId } });

  revalidatePath("/app/garage");
}

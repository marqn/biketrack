"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PartCategory } from "@/lib/default-parts";

export type PartsDisplayOrder = {
  categories: PartCategory[];
  parts: Record<string, string[]>;
};

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getPartsDisplayOrder(): Promise<PartsDisplayOrder | null> {
  const userId = await getSessionUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { partsDisplayOrder: true },
  });
  return (user?.partsDisplayOrder as PartsDisplayOrder) ?? null;
}

export async function savePartsDisplayOrder(order: PartsDisplayOrder) {
  const userId = await getSessionUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { partsDisplayOrder: order as Record<string, unknown> },
  });
  revalidatePath("/app");
}

export async function resetPartsDisplayOrder() {
  const userId = await getSessionUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { partsDisplayOrder: null },
  });
  revalidatePath("/app");
}

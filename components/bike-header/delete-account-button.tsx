"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function deleteAccount() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Usuń konto użytkownika
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  return { success: true };
}

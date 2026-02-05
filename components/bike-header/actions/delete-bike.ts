"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteBike(bikeId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { bikes: { select: { id: true } } },
  });

  if (!user) {
    return { success: false, error: "Użytkownik nie znaleziony" };
  }

  // Nie pozwól usunąć ostatniego roweru
  if (user.bikes.length <= 1) {
    return { success: false, error: "Nie można usunąć ostatniego roweru" };
  }

  // Sprawdź czy rower należy do użytkownika
  const bike = user.bikes.find((b) => b.id === bikeId);
  if (!bike) {
    return { success: false, error: "Rower nie został znaleziony" };
  }

  // Usuń rower (cascade usunie parts, services, replacements)
  await prisma.bike.delete({
    where: { id: bikeId },
  });

  revalidatePath("/app");

  return { success: true };
}

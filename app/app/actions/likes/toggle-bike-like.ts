"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function toggleBikeLike(bikeId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
      select: { isPublic: true, slug: true },
    });

    if (!bike?.isPublic) {
      return { success: false, error: "Rower nie jest publiczny" };
    }

    const existing = await prisma.bikeLike.findUnique({
      where: { bikeId_userId: { bikeId, userId: session.user.id } },
    });

    if (existing) {
      await prisma.bikeLike.delete({
        where: { bikeId_userId: { bikeId, userId: session.user.id } },
      });
      revalidatePath(`/app/discover/bike/${bike.slug}`);
      return { success: true, liked: false };
    } else {
      await prisma.bikeLike.create({
        data: { bikeId, userId: session.user.id },
      });
      revalidatePath(`/app/discover/bike/${bike.slug}`);
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Error toggling bike like:", error);
    return { success: false, error: "Wystąpił błąd" };
  }
}

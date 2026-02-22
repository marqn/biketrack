"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function setBikeThumbnail(bikeId: string, thumbnailUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { userId: true, images: true },
  });

  if (!bike || bike.userId !== session.user.id) {
    return { success: false, error: "Brak uprawnień" };
  }

  if (!bike.images.includes(thumbnailUrl)) {
    return { success: false, error: "Zdjęcie nie istnieje" };
  }

  const reordered = [
    thumbnailUrl,
    ...bike.images.filter((url) => url !== thumbnailUrl),
  ];

  await prisma.bike.update({
    where: { id: bikeId },
    data: { images: reordered },
  });

  revalidatePath("/app");
  return { success: true };
}

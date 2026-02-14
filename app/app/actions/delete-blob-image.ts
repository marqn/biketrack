"use server";

import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function deleteBlobImage(
  entityType: "bike" | "part" | "avatar" | "review",
  entityId: string,
  imageUrl: string
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    if (entityType === "bike") {
      const bike = await prisma.bike.findUnique({
        where: { id: entityId },
        select: { userId: true, images: true },
      });
      if (!bike || bike.userId !== session.user.id) {
        return { success: false, error: "Brak uprawnień" };
      }

      // Usuń z Vercel Blob
      if (imageUrl.includes(".public.blob.vercel-storage.com")) {
        await del(imageUrl);
      }

      // Usuń URL z tablicy images
      await prisma.bike.update({
        where: { id: entityId },
        data: {
          images: bike.images.filter((url) => url !== imageUrl),
        },
      });
    } else if (entityType === "part") {
      const part = await prisma.bikePart.findUnique({
        where: { id: entityId },
        include: { bike: { select: { userId: true } } },
      });
      if (!part || part.bike.userId !== session.user.id) {
        return { success: false, error: "Brak uprawnień" };
      }

      if (imageUrl.includes(".public.blob.vercel-storage.com")) {
        await del(imageUrl);
      }

      await prisma.bikePart.update({
        where: { id: entityId },
        data: {
          images: part.images.filter((url) => url !== imageUrl),
        },
      });
    } else if (entityType === "avatar") {
      if (entityId !== session.user.id) {
        return { success: false, error: "Brak uprawnień" };
      }

      if (imageUrl.includes(".public.blob.vercel-storage.com")) {
        await del(imageUrl);
      }

      await prisma.user.update({
        where: { id: entityId },
        data: { image: null },
      });
    } else if (entityType === "review") {
      const review = await prisma.partReview.findUnique({
        where: { id: entityId },
        select: { userId: true, images: true },
      });
      if (!review || review.userId !== session.user.id) {
        return { success: false, error: "Brak uprawnień" };
      }

      if (imageUrl.includes(".public.blob.vercel-storage.com")) {
        await del(imageUrl);
      }

      await prisma.partReview.update({
        where: { id: entityId },
        data: {
          images: review.images.filter((url) => url !== imageUrl),
        },
      });
    }

    revalidatePath("/app", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error deleting blob image:", error);
    return { success: false, error: "Wystąpił błąd podczas usuwania zdjęcia" };
  }
}

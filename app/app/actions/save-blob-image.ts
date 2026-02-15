"use server";

import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function saveBlobImage(
  entityType: "bike" | "part" | "avatar" | "review" | "product",
  entityId: string,
  blobUrl: string
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    if (!blobUrl || !blobUrl.startsWith("https://")) {
      return { success: false, error: "Nieprawidłowy URL" };
    }

    if (entityType === "bike") {
      const bike = await prisma.bike.findUnique({
        where: { id: entityId },
        select: { userId: true, images: true },
      });
      if (!bike || bike.userId !== session.user.id) {
        return { success: false, error: "Brak uprawnień" };
      }
      if (bike.images.length >= 3) {
        return { success: false, error: "Maksymalnie 3 zdjęcia" };
      }

      await prisma.bike.update({
        where: { id: entityId },
        data: {
          images: { push: blobUrl },
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
      if (part.images.length >= 1) {
        return { success: false, error: "Maksymalnie 1 zdjęcie" };
      }

      await prisma.bikePart.update({
        where: { id: entityId },
        data: {
          images: { push: blobUrl },
        },
      });
    } else if (entityType === "avatar") {
      if (entityId !== session.user.id) {
        return { success: false, error: "Brak uprawnień" };
      }

      // Usuń stary avatar z Blob jeśli to Vercel Blob URL
      const user = await prisma.user.findUnique({
        where: { id: entityId },
        select: { image: true },
      });
      if (
        user?.image &&
        user.image.includes(".public.blob.vercel-storage.com")
      ) {
        try {
          await del(user.image);
        } catch {
          // Ignoruj błędy usuwania starego avatara
        }
      }

      await prisma.user.update({
        where: { id: entityId },
        data: { image: blobUrl },
      });
    } else if (entityType === "product") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        return { success: false, error: "Brak uprawnień" };
      }
      const product = await prisma.partProduct.findUnique({
        where: { id: entityId },
        select: { officialImageUrl: true },
      });
      if (!product) {
        return { success: false, error: "Produkt nie istnieje" };
      }
      if (product.officialImageUrl) {
        return { success: false, error: "Produkt ma już zdjęcie" };
      }

      await prisma.partProduct.update({
        where: { id: entityId },
        data: {
          officialImageUrl: blobUrl,
        },
      });
    } else if (entityType === "review") {
      const review = await prisma.partReview.findUnique({
        where: { id: entityId },
        select: { userId: true, images: true },
      });
      if (!review || review.userId !== session.user.id) {
        return { success: false, error: "Brak uprawnień" };
      }
      if (review.images.length >= 3) {
        return { success: false, error: "Maksymalnie 3 zdjęcia" };
      }

      await prisma.partReview.update({
        where: { id: entityId },
        data: {
          images: { push: blobUrl },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving blob image:", error);
    return { success: false, error: "Wystąpił błąd podczas zapisywania zdjęcia" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB w base64
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp"];

export async function uploadBikeImage(bikeId: string, imageBase64: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
      select: { id: true, userId: true },
    });

    if (!bike) {
      return { success: false, error: "Rower nie został znaleziony" };
    }

    if (bike.userId !== session.user.id) {
      return { success: false, error: "Brak uprawnień" };
    }

    // Walidacja rozmiaru
    if (imageBase64.length > MAX_IMAGE_SIZE) {
      return { success: false, error: "Zdjęcie jest za duże (max 2MB)" };
    }

    // Walidacja formatu
    const formatMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    if (!formatMatch || !ALLOWED_FORMATS.includes(formatMatch[1])) {
      return { success: false, error: "Nieprawidłowy format zdjęcia. Dozwolone: JPG, PNG, WebP" };
    }

    await prisma.bike.update({
      where: { id: bikeId },
      data: { imageUrl: imageBase64 },
    });

    revalidatePath("/app", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error uploading bike image:", error);
    return { success: false, error: "Wystąpił błąd podczas zapisywania zdjęcia" };
  }
}

export async function removeBikeImage(bikeId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
      select: { id: true, userId: true },
    });

    if (!bike || bike.userId !== session.user.id) {
      return { success: false, error: "Brak uprawnień" };
    }

    await prisma.bike.update({
      where: { id: bikeId },
      data: { imageUrl: null },
    });

    revalidatePath("/app", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error removing bike image:", error);
    return { success: false, error: "Wystąpił błąd" };
  }
}

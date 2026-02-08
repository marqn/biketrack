"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

function generateSlug(brand?: string | null, model?: string | null, id?: string): string {
  const parts: string[] = [];
  if (brand) parts.push(brand);
  if (model) parts.push(model);

  let base = parts.length > 0
    ? parts.join(" ").toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    : "rower";

  // Dodaj krótki suffix z id dla unikalności
  const suffix = (id || Math.random().toString(36)).slice(-6);
  return `${base}-${suffix}`;
}

export async function toggleBikeVisibility(bikeId: string, isPublic: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
      select: { id: true, userId: true, slug: true, brand: true, model: true },
    });

    if (!bike) {
      return { success: false, error: "Rower nie został znaleziony" };
    }

    if (bike.userId !== session.user.id) {
      return { success: false, error: "Brak uprawnień" };
    }

    // Generuj slug tylko jeśli włączamy publiczność i nie ma jeszcze sluga
    const slug = isPublic && !bike.slug
      ? generateSlug(bike.brand, bike.model, bike.id)
      : bike.slug;

    await prisma.bike.update({
      where: { id: bikeId },
      data: { isPublic, slug },
    });

    revalidatePath("/app", "layout");

    return { success: true, slug };
  } catch (error) {
    console.error("Error toggling bike visibility:", error);
    return { success: false, error: "Wystąpił błąd" };
  }
}

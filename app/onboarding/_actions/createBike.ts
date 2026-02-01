"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BikeType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS } from "@/lib/default-parts";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Normalizacja tekstu do Title Case (np. "trek" -> "Trek", "CANNONDALE" -> "Cannondale")
function toTitleCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface CreateBikeParams {
  type: BikeType;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
}

export async function createBike({ type, brand, model, year }: CreateBikeParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { bikes: true },
  });

  if (!user) redirect("/login");

  if (user.bikes.length > 0) {
    redirect("/app");
  }

  let finalBrand = brand?.trim() || null;
  let finalModel = model?.trim() || null;

  // Jeśli użytkownik podał markę i model, sprawdź czy już istnieje (case-insensitive)
  if (finalBrand && finalModel) {
    const existingProduct = await prisma.bikeProduct.findFirst({
      where: {
        bikeType: type,
        brand: { equals: finalBrand, mode: "insensitive" },
        model: { equals: finalModel, mode: "insensitive" },
      },
    });

    if (existingProduct) {
      // Użyj istniejących danych (zachowaj spójność zapisu)
      finalBrand = existingProduct.brand;
      finalModel = existingProduct.model;
    } else {
      // Nowy produkt - normalizuj do Title Case
      finalBrand = toTitleCase(finalBrand);
      finalModel = toTitleCase(finalModel);

      await prisma.bikeProduct.create({
        data: {
          bikeType: type,
          brand: finalBrand,
          model: finalModel,
          year: year || undefined,
        },
      });
    }
  }

  await prisma.bike.create({
    data: {
      type,
      brand: finalBrand || undefined,
      model: finalModel || undefined,
      userId: user.id,
      parts: {
        create: DEFAULT_PARTS[type],
      },
    },
  });

  redirect("/app");
}

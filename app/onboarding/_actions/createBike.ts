"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BikeType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS, EBIKE_PARTS, getDefaultIsInstalled } from "@/lib/default-parts";
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
  bikeProductId?: string | null;
  isElectric?: boolean;
}

export async function createBike({ type, brand, model, year, bikeProductId, isElectric = false }: CreateBikeParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { bikes: true },
  });

  if (!user) redirect("/login");

  // Premium: do 10 rowerów, Free: 1 rower
  const isPremium = user.plan === "PREMIUM" && user.planExpiresAt && user.planExpiresAt > new Date();
  const maxBikes = isPremium ? 10 : 1;

  if (user.bikes.length >= maxBikes) {
    redirect("/app");
  }

  let finalBrand = brand?.trim() || null;
  let finalModel = model?.trim() || null;
  let resolvedBikeProductId = bikeProductId || null;

  // Jeśli użytkownik podał markę i model, sprawdź czy już istnieje (case-insensitive, ignoruj bikeType)
  if (finalBrand && finalModel) {
    const existingProduct = await prisma.bikeProduct.findFirst({
      where: {
        brand: { equals: finalBrand, mode: "insensitive" },
        model: { equals: finalModel, mode: "insensitive" },
      },
    });

    if (existingProduct) {
      // Użyj istniejących danych (zachowaj spójność zapisu)
      finalBrand = existingProduct.brand;
      finalModel = existingProduct.model;
      resolvedBikeProductId = existingProduct.id;
    } else {
      // Nowy produkt - normalizuj brand do UPPER CASE
      finalBrand = finalBrand.toUpperCase();
      finalModel = toTitleCase(finalModel);

      const newProduct = await prisma.bikeProduct.create({
        data: {
          bikeType: type,
          brand: finalBrand,
          model: finalModel,
          year: year || undefined,
        },
      });
      resolvedBikeProductId = newProduct.id;
    }
  }

  // Zacznij od domyślnych części dla typu roweru
  const partsMap = new Map<string, { type: typeof DEFAULT_PARTS[BikeType][number]["type"]; expectedKm: number; productId?: string }>();

  for (const p of DEFAULT_PARTS[type]) {
    partsMap.set(p.type, {
      type: p.type,
      expectedKm: p.expectedKm,
    });
  }

  // Dodaj części e-bike jeśli rower jest elektryczny
  if (isElectric) {
    for (const p of EBIKE_PARTS) {
      partsMap.set(p.type, {
        type: p.type,
        expectedKm: p.expectedKm,
      });
    }
  }

  // Nadpisz/dodaj części z BikeProduct jeśli są skonfigurowane
  if (resolvedBikeProductId) {
    const bikeProductWithParts = await prisma.bikeProduct.findUnique({
      where: { id: resolvedBikeProductId },
      include: {
        defaultParts: {
          include: { partProduct: true },
        },
      },
    });

    if (bikeProductWithParts?.defaultParts) {
      for (const dp of bikeProductWithParts.defaultParts) {
        partsMap.set(dp.partType, {
          type: dp.partType,
          expectedKm: dp.expectedKm,
          productId: dp.partProductId,
        });
      }
    }
  }

  const partsToCreate = Array.from(partsMap.values());

  await prisma.bike.create({
    data: {
      type,
      brand: finalBrand || undefined,
      model: finalModel || undefined,
      year: year || undefined,
      isElectric,
      userId: user.id,
      parts: {
        create: partsToCreate.map((p) => ({
          type: p.type,
          expectedKm: p.expectedKm,
          productId: p.productId || undefined,
          installedAt: p.productId ? new Date() : undefined,
          isInstalled: getDefaultIsInstalled(p.type, type),
        })),
      },
    },
  });

  // Zaktualizuj licznik instalacji dla PartProduct
  const productIds = partsToCreate.filter((p) => p.productId).map((p) => p.productId!);
  if (productIds.length > 0) {
    await prisma.partProduct.updateMany({
      where: { id: { in: productIds } },
      data: { totalInstallations: { increment: 1 } },
    });
  }

  redirect("/app");
}

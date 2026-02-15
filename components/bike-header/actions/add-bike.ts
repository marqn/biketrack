"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BikeType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS, EBIKE_PARTS, getPartCategory } from "@/lib/default-parts";
import { revalidatePath } from "next/cache";

const MAX_BIKES_FREE = 1;
const MAX_BIKES_PREMIUM = 10;

function toTitleCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface AddBikeParams {
  type: BikeType;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  bikeProductId?: string | null;
  isElectric?: boolean;
  stravaGearId?: string | null;
  totalKm?: number;
}

export async function addBike({
  type,
  brand,
  model,
  year,
  bikeProductId,
  isElectric = false,
  stravaGearId,
  totalKm = 0,
}: AddBikeParams) {
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

  const isPremium =
    user.plan === "PREMIUM" &&
    user.planExpiresAt &&
    user.planExpiresAt > new Date();

  const maxBikes = isPremium ? MAX_BIKES_PREMIUM : MAX_BIKES_FREE;

  if (user.bikes.length >= maxBikes) {
    return {
      success: false,
      error: isPremium
        ? `Osiągnięto limit ${MAX_BIKES_PREMIUM} rowerów`
        : "Plan darmowy pozwala na 1 rower. Wykup Premium, aby dodać więcej.",
    };
  }

  let finalBrand = brand?.trim() || null;
  let finalModel = model?.trim() || null;
  let resolvedBikeProductId = bikeProductId || null;

  if (finalBrand && finalModel) {
    const existingProduct = await prisma.bikeProduct.findFirst({
      where: {
        brand: { equals: finalBrand, mode: "insensitive" },
        model: { equals: finalModel, mode: "insensitive" },
      },
    });

    if (existingProduct) {
      finalBrand = existingProduct.brand;
      finalModel = existingProduct.model;
      resolvedBikeProductId = existingProduct.id;
    } else {
      finalBrand = toTitleCase(finalBrand);
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

  const partsMap = new Map<
    string,
    {
      type: (typeof DEFAULT_PARTS)[BikeType][number]["type"];
      expectedKm: number;
      productId?: string;
    }
  >();

  for (const p of DEFAULT_PARTS[type]) {
    partsMap.set(p.type, { type: p.type, expectedKm: p.expectedKm });
  }

  if (isElectric) {
    for (const p of EBIKE_PARTS) {
      partsMap.set(p.type, { type: p.type, expectedKm: p.expectedKm });
    }
  }

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

  const newBike = await prisma.bike.create({
    data: {
      type,
      brand: finalBrand || undefined,
      model: finalModel || undefined,
      year: year || undefined,
      isElectric,
      stravaGearId: stravaGearId || undefined,
      totalKm,
      userId: user.id,
      parts: {
        create: partsToCreate.map((p) => ({
          type: p.type,
          expectedKm: p.expectedKm,
          productId: p.productId || undefined,
          installedAt: p.productId ? new Date() : undefined,
          isInstalled: getPartCategory(p.type) !== "accessories",
          wearKm: totalKm,
        })),
      },
    },
  });

  const productIds = partsToCreate
    .filter((p) => p.productId)
    .map((p) => p.productId!);
  if (productIds.length > 0) {
    await prisma.partProduct.updateMany({
      where: { id: { in: productIds } },
      data: { totalInstallations: { increment: 1 } },
    });
  }

  revalidatePath("/app");

  return { success: true, bikeId: newBike.id };
}

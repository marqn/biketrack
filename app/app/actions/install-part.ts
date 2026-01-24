"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PartType } from "@/lib/generated/prisma";

// Pomocnicza funkcja do normalizacji typu części do "kanonicznego" typu
// Używamy jej aby opony i klocki współdzieliły produkty
function getCanonicalPartType(partType: PartType): PartType {
  // Opony zawsze przechowujemy jako TIRE_FRONT
  if (partType === PartType.TIRE_FRONT || partType === PartType.TIRE_REAR) {
    return PartType.TIRE_FRONT;
  }

  // Klocki zawsze przechowujemy jako PADS_FRONT
  if (partType === PartType.PADS_FRONT || partType === PartType.PADS_REAR) {
    return PartType.PADS_FRONT;
  }

  // Wszystkie inne części pozostają bez zmian
  return partType;
}

export interface InstallPartInput {
  partId: string;
  productId?: string; // Jeśli wybrano z autocomplete
  brand?: string; // Jeśli manualny input
  model?: string;
  installedAt?: Date;
  partSpecificData?: Record<string, unknown>;

  // Opcjonalna opinia
  rating?: number;
  reviewText?: string;
  pros?: string[];
  cons?: string[];

  // Czy to jest wymiana części (powoduje zapisanie starej części do historii)
  isReplacement?: boolean;
}

export async function installPart(data: InstallPartInput) {
  let productId = data.productId;

  const part = await prisma.bikePart.findUnique({
    where: { id: data.partId },
    include: { bike: true, product: true },
  });

  if (!part) throw new Error("Part not found");

  // Jeśli to wymiana części, zapisz starą część do historii
  if (data.isReplacement && part.wearKm > 0) {
    await prisma.partReplacement.create({
      data: {
        bikeId: part.bikeId,
        partId: part.id,
        partType: part.type,
        productId: part.productId,
        brand: part.product?.brand || data.brand?.trim() || null,
        model: part.product?.model || data.model?.trim() || null,
        notes: null,
        kmAtReplacement: part.bike.totalKm,
        kmUsed: part.wearKm,
      },
    });
  }

  // Jeśli nie wybrano produktu, utwórz nowy (upsert)
  if (!productId && data.brand && data.model) {
    const canonicalType = getCanonicalPartType(part.type);

    const product = await prisma.partProduct.upsert({
      where: {
        type_brand_model: {
          type: canonicalType,
          brand: data.brand,
          model: data.model,
        },
      },
      create: {
        type: canonicalType,
        brand: data.brand,
        model: data.model,
        specifications: data.partSpecificData as any,
        totalInstallations: 1,
      },
      update: {
        totalInstallations: { increment: 1 },
      },
    });
    productId = product.id;
  } else if (productId) {
    // Increment installations
    await prisma.partProduct.update({
      where: { id: productId },
      data: { totalInstallations: { increment: 1 } },
    });
  }

  // Aktualizuj BikePart
  await prisma.bikePart.update({
    where: { id: data.partId },
    data: {
      productId,
      installedAt: data.installedAt || new Date(),
      partSpecificData: data.partSpecificData as any,
      // Jeśli to wymiana, wyzeruj zużycie
      ...(data.isReplacement && { wearKm: 0 }),
    },
  });

  // Jeśli dodano opinię, utwórz PartReview
  if (data.rating && productId) {
    // Sprawdź czy użytkownik już nie ma opinii dla tej części
    const existingReview = await prisma.partReview.findUnique({
      where: {
        userId_partId: {
          userId: part.bike.userId,
          partId: data.partId,
        },
      },
    });

    if (existingReview) {
      // Aktualizuj istniejącą opinię
      await prisma.partReview.update({
        where: { id: existingReview.id },
        data: {
          rating: data.rating,
          reviewText: data.reviewText,
          pros: data.pros || [],
          cons: data.cons || [],
          kmAtReview: part.bike.totalKm,
          kmUsed: part.wearKm,
        },
      });
    } else {
      // Utwórz nową opinię
      await prisma.partReview.create({
        data: {
          userId: part.bike.userId,
          partId: data.partId,
          productId,
          rating: data.rating,
          reviewText: data.reviewText,
          pros: data.pros || [],
          cons: data.cons || [],
          kmAtReview: part.bike.totalKm,
          kmUsed: part.wearKm,
          bikeType: part.bike.type,
        },
      });
    }

    // Aktualizuj statystyki produktu
    await updateProductStats(productId);
  }

  revalidatePath("/app");
}

// Funkcja pomocnicza do aktualizacji statystyk produktu
async function updateProductStats(productId: string) {
  const stats = await prisma.partReview.aggregate({
    where: { productId, verified: true },
    _avg: {
      rating: true,
      kmUsed: true,
    },
    _count: {
      id: true,
    },
  });

  await prisma.partProduct.update({
    where: { id: productId },
    data: {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.id,
      averageKmLifespan: Math.round(stats._avg.kmUsed || 0),
    },
  });
}

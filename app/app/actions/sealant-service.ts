"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ServiceType, PartType, Prisma } from "@/lib/generated/prisma";

interface ChangeSealantInput {
  bikeId: string;
  currentKm: number;
  wheel: "front" | "rear";
  // Produkt (opcjonalne)
  productId?: string;
  brand?: string;
  model?: string;
  unknownProduct?: boolean;
  // Opinia
  rating?: number;
  reviewText?: string;
}

export async function changeSealant(input: ChangeSealantInput) {
  const {
    bikeId,
    currentKm,
    wheel,
    productId,
    brand,
    model,
    unknownProduct,
    rating,
    reviewText,
  } = input;

  if (!bikeId || isNaN(currentKm)) {
    throw new Error("Brak wymaganych danych");
  }

  const serviceType =
    wheel === "front" ? ServiceType.SEALANT_FRONT : ServiceType.SEALANT_REAR;

  let finalProductId = productId;
  let finalBrand = brand?.trim().toUpperCase() || null;

  // Jeśli użytkownik podał markę i model, ale nie ma productId - utwórz/znajdź produkt
  if (!finalProductId && finalBrand && model?.trim() && !unknownProduct) {
    const product = await prisma.partProduct.upsert({
      where: {
        type_brand_model: {
          type: PartType.TUBELESS_SEALANT,
          brand: finalBrand,
          model: model.trim(),
        },
      },
      create: {
        type: PartType.TUBELESS_SEALANT,
        brand: finalBrand,
        model: model.trim(),
        specifications: Prisma.JsonNull,
        totalInstallations: 1,
      },
      update: {
        totalInstallations: { increment: 1 },
      },
    });
    finalProductId = product.id;
  } else if (finalProductId) {
    // Zwiększ licznik użyć istniejącego produktu
    const product = await prisma.partProduct.update({
      where: { id: finalProductId },
      data: { totalInstallations: { increment: 1 } },
      select: { brand: true, model: true },
    });
    if (!finalBrand) {
      finalBrand = `${product.brand} ${product.model}`;
    }
  }

  // Pobierz info o rowerze dla opinii
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { userId: true, type: true },
  });

  if (!bike) throw new Error("Nie znaleziono roweru");

  // Utwórz zdarzenie serwisowe
  const serviceEvent = await prisma.serviceEvent.create({
    data: {
      bikeId,
      type: serviceType,
      kmAtTime: currentKm,
      lubricantBrand: finalBrand,
      lubricantProductId: finalProductId || null,
      notes: reviewText?.trim() || null,
    },
  });

  // Utwórz/zaktualizuj opinię jeśli podano ocenę i mamy produkt
  if (rating && rating >= 1 && rating <= 5 && finalProductId) {
    const existingReview = await prisma.partReview.findFirst({
      where: {
        userId: bike.userId,
        productId: finalProductId,
        serviceEventId: { not: null },
      },
    });

    if (existingReview) {
      if (
        existingReview.rating !== rating ||
        existingReview.reviewText !== (reviewText?.trim() || null)
      ) {
        await prisma.partReview.update({
          where: { id: existingReview.id },
          data: {
            rating,
            reviewText: reviewText?.trim() || null,
            kmAtReview: currentKm,
          },
        });
        await updateSealantProductStats(finalProductId);
      }
    } else {
      await prisma.partReview.create({
        data: {
          userId: bike.userId,
          productId: finalProductId,
          serviceEventId: serviceEvent.id,
          rating,
          reviewText: reviewText?.trim() || null,
          kmAtReview: currentKm,
          kmUsed: 0,
          bikeType: bike.type,
        },
      });
      await updateSealantProductStats(finalProductId);
    }
  }

  revalidatePath("/app");

  return serviceEvent;
}

async function updateSealantProductStats(productId: string) {
  const stats = await prisma.partReview.aggregate({
    where: {
      productId,
      serviceEventId: { not: null },
      verified: true,
    },
    _avg: { rating: true, kmUsed: true },
    _count: { id: true },
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

export async function deleteSealantEvent(eventId: string | null) {
  if (!eventId) return;

  const event = await prisma.serviceEvent.findUnique({
    where: { id: eventId },
    select: { lubricantProductId: true },
  });

  await prisma.partReview.deleteMany({
    where: { serviceEventId: eventId },
  });

  await prisma.serviceEvent.delete({
    where: { id: eventId },
  });

  if (event?.lubricantProductId) {
    await updateSealantProductStats(event.lubricantProductId);
  }

  revalidatePath("/app");
}

export async function updateSealantEvent(
  eventId: string,
  data: {
    lubricantBrand?: string;
    lubricantProductId?: string | null;
    notes?: string;
    rating?: number;
    reviewText?: string;
  }
) {
  const event = await prisma.serviceEvent.findUnique({
    where: { id: eventId },
    select: {
      bikeId: true,
      kmAtTime: true,
      lubricantProductId: true,
      bike: { select: { userId: true, type: true } },
    },
  });

  if (!event) throw new Error("Nie znaleziono zdarzenia");

  await prisma.serviceEvent.update({
    where: { id: eventId },
    data: {
      lubricantBrand: data.lubricantBrand?.trim().toUpperCase() || null,
      lubricantProductId: data.lubricantProductId,
      notes: data.notes?.trim() || null,
    },
  });

  const productId = data.lubricantProductId || event.lubricantProductId;

  if (data.rating && data.rating >= 1 && data.rating <= 5 && productId) {
    await prisma.partReview.upsert({
      where: {
        userId_serviceEventId: {
          userId: event.bike.userId,
          serviceEventId: eventId,
        },
      },
      create: {
        userId: event.bike.userId,
        productId,
        serviceEventId: eventId,
        rating: data.rating,
        reviewText: data.reviewText?.trim() || null,
        kmAtReview: event.kmAtTime,
        kmUsed: 0,
        bikeType: event.bike.type,
      },
      update: {
        rating: data.rating,
        reviewText: data.reviewText?.trim() || null,
        productId,
      },
    });

    await updateSealantProductStats(productId);
  }

  if (event.lubricantProductId && event.lubricantProductId !== productId) {
    await updateSealantProductStats(event.lubricantProductId);
  }

  revalidatePath("/app");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ServiceType, PartType, Prisma } from "@/lib/generated/prisma";

interface LubeChainInput {
  bikeId: string;
  currentKm: number;
  // Produkt (opcjonalne)
  productId?: string;
  brand?: string;
  model?: string;
  lubricantType?: "wax" | "oil";
  // Jeśli nie zna produktu, tylko marka
  unknownProduct?: boolean;
  // Opinia
  rating?: number;
  reviewText?: string;
}

export async function lubeChain(input: LubeChainInput) {
  const {
    bikeId,
    currentKm,
    productId,
    brand,
    model,
    lubricantType,
    unknownProduct,
    rating,
    reviewText,
  } = input;

  if (!bikeId || isNaN(currentKm)) {
    throw new Error("Brak wymaganych danych");
  }

  let finalProductId = productId;
  let finalBrand = brand?.trim() || null;

  // Jeśli użytkownik podał markę i model, ale nie ma productId - utwórz/znajdź produkt
  if (!finalProductId && finalBrand && model?.trim() && !unknownProduct) {
    const product = await prisma.partProduct.upsert({
      where: {
        type_brand_model: {
          type: PartType.LUBRICANT,
          brand: finalBrand,
          model: model.trim(),
        },
      },
      create: {
        type: PartType.LUBRICANT,
        brand: finalBrand,
        model: model.trim(),
        specifications: lubricantType ? { lubricantType } : Prisma.JsonNull,
        totalInstallations: 1,
      },
      update: {
        totalInstallations: { increment: 1 },
        // Aktualizuj specyfikację jeśli podana
        ...(lubricantType && {
          specifications: { lubricantType },
        }),
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
    // Ustaw markę z produktu jeśli nie podana
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
      type: ServiceType.CHAIN_LUBE,
      kmAtTime: currentKm,
      lubricantBrand: finalBrand,
      lubricantProductId: finalProductId || null,
      notes: reviewText?.trim() || null, // Opinia jako notes dla kompatybilności wstecznej
    },
  });

  // Utwórz opinię jeśli podano ocenę i mamy produkt
  if (rating && rating >= 1 && rating <= 5 && finalProductId) {
    // Sprawdź czy już istnieje opinia dla tego zdarzenia
    const existingReview = await prisma.partReview.findUnique({
      where: {
        userId_serviceEventId: {
          userId: bike.userId,
          serviceEventId: serviceEvent.id,
        },
      },
    });

    if (!existingReview) {
      await prisma.partReview.create({
        data: {
          userId: bike.userId,
          productId: finalProductId,
          serviceEventId: serviceEvent.id,
          rating,
          reviewText: reviewText?.trim() || null,
          kmAtReview: currentKm,
          kmUsed: 0, // Będzie zaktualizowane przy następnym smarowaniu
          bikeType: bike.type,
        },
      });

      // Zaktualizuj statystyki produktu
      await updateLubricantProductStats(finalProductId);
    }
  }

  revalidatePath(`/app/bikes/${bikeId}`);
  revalidatePath("/app");

  return serviceEvent;
}

// Legacy funkcja dla kompatybilności wstecznej z FormData
export async function lubeChainLegacy(formData: FormData) {
  const bikeId = formData.get("bikeId") as string;
  const currentKm = parseInt(formData.get("currentKm") as string);
  const lubricantBrand = formData.get("lubricantBrand") as string | null;
  const notes = formData.get("notes") as string | null;

  return lubeChain({
    bikeId,
    currentKm,
    brand: lubricantBrand || undefined,
    unknownProduct: true,
    reviewText: notes || undefined,
  });
}

// Helper do aktualizacji statystyk produktu smarowego
async function updateLubricantProductStats(productId: string) {
  const stats = await prisma.partReview.aggregate({
    where: {
      productId,
      serviceEventId: { not: null }, // Tylko opinie o smarach
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

export async function deleteLubeEvent(eventId: string | null) {
  if (!eventId) return;

  const event = await prisma.serviceEvent.findUnique({
    where: { id: eventId },
    select: { lubricantProductId: true },
  });

  // Usuń powiązaną opinię
  await prisma.partReview.deleteMany({
    where: { serviceEventId: eventId },
  });

  await prisma.serviceEvent.delete({
    where: { id: eventId },
  });

  // Zaktualizuj statystyki produktu jeśli był powiązany
  if (event?.lubricantProductId) {
    await updateLubricantProductStats(event.lubricantProductId);
  }

  revalidatePath("/app");
}

export async function updateLubeEvent(
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

  // Aktualizuj zdarzenie
  await prisma.serviceEvent.update({
    where: { id: eventId },
    data: {
      lubricantBrand: data.lubricantBrand?.trim() || null,
      lubricantProductId: data.lubricantProductId,
      notes: data.notes?.trim() || null,
    },
  });

  // Obsłuż opinię
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

    await updateLubricantProductStats(productId);
  }

  // Jeśli zmienił się produkt, zaktualizuj statystyki starego
  if (event.lubricantProductId && event.lubricantProductId !== productId) {
    await updateLubricantProductStats(event.lubricantProductId);
  }

  revalidatePath("/app");
}

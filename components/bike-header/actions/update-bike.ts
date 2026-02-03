"use server";

import { prisma } from "@/lib/prisma";
import { BikeType, PartType } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { EBIKE_PARTS } from "@/lib/default-parts";

// Normalizacja tekstu do Title Case (np. "trek" -> "Trek", "CANNONDALE" -> "Cannondale")
function toTitleCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface UpdateBikeData {
  brand: string;
  model: string;
  year: number | null;
  type: BikeType;
  isElectric: boolean;
}

export async function updateBike(
  bikeId: string,
  userId: string,
  data: UpdateBikeData
) {
  try {
    // Sprawdź czy rower należy do użytkownika
    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
      select: { id: true, userId: true, isElectric: true, totalKm: true },
    });

    if (!bike) {
      return {
        success: false,
        error: "Rower nie został znaleziony",
      };
    }

    if (bike.userId !== userId) {
      return {
        success: false,
        error: "Brak uprawnień",
      };
    }

    let finalBrand = data.brand.trim() || null;
    let finalModel = data.model.trim() || null;

    // Jeśli marka i model są podane, sprawdź czy już istnieje (case-insensitive, ignoruj bikeType)
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
        // Zaktualizuj rok jeśli podany
        if (data.year && !existingProduct.year) {
          await prisma.bikeProduct.update({
            where: { id: existingProduct.id },
            data: { year: data.year },
          });
        }
      } else {
        // Nowy produkt - normalizuj do Title Case
        finalBrand = toTitleCase(finalBrand);
        finalModel = toTitleCase(finalModel);

        await prisma.bikeProduct.create({
          data: {
            bikeType: data.type,
            brand: finalBrand,
            model: finalModel,
            year: data.year,
          },
        });
      }
    }

    // Obsługa zmiany isElectric - dodaj lub usuń części e-bike
    const ebikePartTypes: PartType[] = [PartType.MOTOR, PartType.BATTERY, PartType.CONTROLLER];

    if (data.isElectric && !bike.isElectric) {
      // Rower stał się elektryczny - dodaj części e-bike
      for (const p of EBIKE_PARTS) {
        await prisma.bikePart.upsert({
          where: { bikeId_type: { bikeId, type: p.type } },
          create: {
            bikeId,
            type: p.type,
            expectedKm: p.expectedKm,
            wearKm: bike.totalKm,
          },
          update: {},
        });
      }
    } else if (!data.isElectric && bike.isElectric) {
      // Rower przestał być elektryczny - usuń części e-bike
      await prisma.bikePart.deleteMany({
        where: {
          bikeId,
          type: { in: ebikePartTypes },
        },
      });
    }

    // Aktualizuj rower
    const updatedBike = await prisma.bike.update({
      where: { id: bikeId },
      data: {
        brand: finalBrand,
        model: finalModel,
        year: data.year,
        type: data.type,
        isElectric: data.isElectric,
      },
    });

    // Odśwież cache Next.js
    revalidatePath("/app");
    revalidatePath(`/app/bike/${bikeId}`);

    return { success: true, bike: updatedBike };
  } catch (error) {
    console.error("Error updating bike:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas aktualizacji roweru",
    };
  }
}
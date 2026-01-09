"use server";

import { prisma } from "@/lib/prisma";
import { BikeType } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

interface UpdateBikeData {
  name: string;
  brand: string;
  model: string;
  type: BikeType; // ← Zawsze wymagane
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
      select: { id: true, userId: true },
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

    // Walidacja - nazwa jest wymagana
    if (!data.name.trim()) {
      return {
        success: false,
        error: "Nazwa roweru jest wymagana",
      };
    }

    // Aktualizuj rower
    const updatedBike = await prisma.bike.update({
      where: { id: bikeId },
      data: {
        name: data.name.trim(),
        brand: data.brand.trim() || null,
        model: data.model.trim() || null,
        type: data.type, // ← Zawsze ustawione
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
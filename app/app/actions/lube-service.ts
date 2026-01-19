"use server";

import { revalidatePath } from "next/cache";
import {prisma} from "@/lib/prisma";
import { ServiceType } from "@/lib/generated/prisma";

export async function lubeChain(formData: FormData) {
  const bikeId = formData.get("bikeId") as string;
  const currentKm = parseInt(formData.get("currentKm") as string);
  const lubricantBrand = formData.get("lubricantBrand") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!bikeId || isNaN(currentKm)) {
    throw new Error("Brak wymaganych danych");
  }

  await prisma.serviceEvent.create({
    data: {
      bikeId,
      type: ServiceType.CHAIN_LUBE,
      kmAtTime: currentKm,
      lubricantBrand: lubricantBrand?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  revalidatePath(`/app/bikes/${bikeId}`);
  revalidatePath("/app");
}

export async function deleteLubeEvent(eventId: string) {
  await prisma.serviceEvent.delete({
    where: { id: eventId },
  });

  revalidatePath("/app");
}

export async function updateLubeEvent(
  eventId: string,
  data: {
    lubricantBrand?: string;
    notes?: string;
  }
) {
  await prisma.serviceEvent.update({
    where: { id: eventId },
    data: {
      lubricantBrand: data.lubricantBrand?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath("/app");
}
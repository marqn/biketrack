"use server";

import { prisma } from "@/lib/prisma";
import { PartType } from "@/lib/generated/prisma";

// Pomocnicza funkcja do grupowania typów części które współdzielą produkty
function getRelatedPartTypes(partType: PartType): PartType[] {
  // Opony przednie i tylne współdzielą te same produkty
  if (partType === PartType.TIRE_FRONT || partType === PartType.TIRE_REAR) {
    return [PartType.TIRE_FRONT, PartType.TIRE_REAR];
  }

  // Klocki przednie i tylne współdzielą te same produkty
  if (partType === PartType.PADS_FRONT || partType === PartType.PADS_REAR) {
    return [PartType.PADS_FRONT, PartType.PADS_REAR];
  }

  // Wszystkie inne części są unikalne
  return [partType];
}

export async function searchProducts(partType: PartType, query: string) {
  if (query.length < 2) return [];

  const relatedTypes = getRelatedPartTypes(partType);

  const products = await prisma.partProduct.findMany({
    where: {
      type: { in: relatedTypes },
      OR: [
        { brand: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: [
      { averageRating: "desc" },
      { totalReviews: "desc" },
    ],
    take: 10,
  });

  return products;
}

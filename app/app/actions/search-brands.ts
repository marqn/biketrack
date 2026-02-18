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

  // Tarcze hamulcowe przednie i tylne współdzielą te same produkty
  if (partType === PartType.DISC_FRONT || partType === PartType.DISC_REAR) {
    return [PartType.DISC_FRONT, PartType.DISC_REAR];
  }

  // Wszystkie inne części są unikalne
  return [partType];
}

export async function searchBrands(partTypeStr: string, query: string) {
  if (query.length < 1) return [];

  // Konwersja stringa na enum - pobieramy wartość z obiektu PartType
  const partType = PartType[partTypeStr as keyof typeof PartType];
  if (!partType) return [];

  const relatedTypes = getRelatedPartTypes(partType);

  // Używamy OR zamiast in dla lepszej kompatybilności z typami enum
  const products = await prisma.partProduct.findMany({
    where: {
      AND: [
        { OR: relatedTypes.map((t) => ({ type: t })) },
        { brand: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      brand: true,
    },
    distinct: ["brand"],
    orderBy: {
      brand: "asc",
    },
    take: 10,
  });

  return products.map((p) => p.brand);
}

export async function searchModels(
  partTypeStr: string,
  brand: string,
  query: string
) {
  if (!brand) return [];

  // Konwersja stringa na enum - pobieramy wartość z obiektu PartType
  const partType = PartType[partTypeStr as keyof typeof PartType];
  if (!partType) return [];

  const relatedTypes = getRelatedPartTypes(partType);

  // Budujemy warunki - filtr modelu tylko gdy query niepuste
  const whereConditions = [
    { OR: relatedTypes.map((t: PartType) => ({ type: t })) },
    { brand: { equals: brand, mode: "insensitive" as const } },
  ];

  if (query.length > 0) {
    whereConditions.push({ model: { contains: query, mode: "insensitive" as const } } as any);
  }

  const products = await prisma.partProduct.findMany({
    where: {
      AND: whereConditions,
    },
    orderBy: [{ averageRating: "desc" }, { totalReviews: "desc" }],
    take: 10,
  });

  return products;
}

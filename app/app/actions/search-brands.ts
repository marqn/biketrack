"use server";

import { prisma } from "@/lib/prisma";
import { PartType } from "@/lib/generated/prisma";

// Normalizacja marki: tylko pierwsza litera wielka, reszta bez zmian
function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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

export async function getPopularBrands(partTypeStr: string) {
  const partType = PartType[partTypeStr as keyof typeof PartType];
  if (!partType) return [];

  const relatedTypes = getRelatedPartTypes(partType);

  const brands = await prisma.partProduct.groupBy({
    by: ["brand"],
    where: {
      OR: relatedTypes.map((t) => ({ type: t })),
    },
    _count: { brand: true },
    orderBy: { _count: { brand: "desc" } },
    take: 5,
  });

  return brands.map((b) => capitalizeFirst(b.brand));
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

  // Normalizuj i deduplikuj marki (case-insensitive)
  const seen = new Set<string>();
  return products
    .map((p) => capitalizeFirst(p.brand))
    .filter((brand) => {
      const key = brand.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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
    take: 20, // Pobierz więcej, bo po deduplikacji może być mniej
  });

  // Normalizuj nazwy modeli i deduplikuj (case-insensitive)
  const seen = new Set<string>();
  return products
    .map((p) => ({ ...p, brand: capitalizeFirst(p.brand) }))
    .filter((p) => {
      const key = p.model.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

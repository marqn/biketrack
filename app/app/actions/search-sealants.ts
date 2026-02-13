"use server";

import { prisma } from "@/lib/prisma";
import { PartType } from "@/lib/generated/prisma";
import { PartProduct } from "@/lib/types";

// Wyszukaj marki mleka tubeless z PartProduct
export async function searchSealantBrands(query: string): Promise<string[]> {
  if (query.length < 1) return [];

  const products = await prisma.partProduct.findMany({
    where: {
      type: PartType.TUBELESS_SEALANT,
      brand: { contains: query, mode: "insensitive" },
    },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
    take: 10,
  });

  return products.map((p) => p.brand);
}

// Wyszukaj modele mleka dla danej marki
export async function searchSealantModels(
  brand: string,
  query: string
): Promise<PartProduct[]> {
  if (!brand || query.length < 1) return [];

  const products = await prisma.partProduct.findMany({
    where: {
      type: PartType.TUBELESS_SEALANT,
      brand: { equals: brand, mode: "insensitive" },
      model: { contains: query, mode: "insensitive" },
    },
    orderBy: [{ averageRating: "desc" }, { totalReviews: "desc" }],
    take: 10,
  });

  return products as PartProduct[];
}

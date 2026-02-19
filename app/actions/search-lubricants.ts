"use server";

import { prisma } from "@/lib/prisma";
import { PartType } from "@/lib/generated/prisma";
import { PartProduct } from "@/lib/types";

// Wyszukaj marki smarów z PartProduct
export async function searchLubricantBrands(query: string): Promise<string[]> {
  if (query.length < 1) return [];

  const products = await prisma.partProduct.findMany({
    where: {
      type: PartType.LUBRICANT,
      brand: { contains: query, mode: "insensitive" },
    },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
    take: 10,
  });

  return products.map((p) => p.brand);
}

// Wyszukaj modele smarów dla danej marki
export async function searchLubricantModels(
  brand: string,
  query: string
): Promise<PartProduct[]> {
  if (!brand) return [];

  const whereConditions: any[] = [
    { type: PartType.LUBRICANT },
    { brand: { equals: brand, mode: "insensitive" } },
  ];

  if (query.length > 0) {
    whereConditions.push({ model: { contains: query, mode: "insensitive" } });
  }

  const products = await prisma.partProduct.findMany({
    where: {
      AND: whereConditions,
    },
    orderBy: [{ averageRating: "desc" }, { totalReviews: "desc" }],
    take: 10,
  });

  return products as PartProduct[];
}

// Wyszukaj wszystkie produkty smarów (marka + model)
export async function searchLubricantProducts(
  query: string
): Promise<PartProduct[]> {
  if (query.length < 2) return [];

  const products = await prisma.partProduct.findMany({
    where: {
      type: PartType.LUBRICANT,
      OR: [
        { brand: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: [{ averageRating: "desc" }, { totalReviews: "desc" }],
    take: 10,
  });

  return products as PartProduct[];
}

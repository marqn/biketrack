"use server";

import { prisma } from "@/lib/prisma";

export async function searchBikeBrands(query: string) {
  if (query.length < 1) return [];

  const products = await prisma.bikeProduct.findMany({
    where: {
      brand: { contains: query, mode: "insensitive" },
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

export async function searchBikeModels(brand: string, query: string) {
  if (!brand) return [];

  const where: any = {
    brand: { equals: brand, mode: "insensitive" },
  };

  if (query.length > 0) {
    where.model = { contains: query, mode: "insensitive" };
  }

  const products = await prisma.bikeProduct.findMany({
    where,
    orderBy: [{ model: "asc" }],
    take: 10,
  });

  return products;
}

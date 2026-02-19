"use server";

import { prisma } from "@/lib/prisma";

export interface TopProductWithReviews {
  id: string;
  type: string;
  brand: string;
  model: string;
  averageRating: number | null;
  totalReviews: number;
  totalInstallations: number;
  averageKmLifespan: number | null;
  reviews: Array<{
    rating: number;
    reviewText: string | null;
  }>;
}

export async function getTopProducts(limit = 6): Promise<TopProductWithReviews[]> {
  const products = await prisma.partProduct.findMany({
    where: {
      totalReviews: { gt: 0 },
    },
    orderBy: [
      { totalInstallations: "desc" },
      { averageRating: "desc" },
    ],
    take: limit,
    include: {
      reviews: {
        take: 3,
        orderBy: { rating: "desc" },
        select: {
          rating: true,
          reviewText: true,
        },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    type: p.type,
    brand: p.brand,
    model: p.model,
    averageRating: p.averageRating,
    totalReviews: p.totalReviews,
    totalInstallations: p.totalInstallations,
    averageKmLifespan: p.averageKmLifespan,
    reviews: p.reviews,
  }));
}

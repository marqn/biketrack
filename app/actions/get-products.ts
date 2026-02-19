"use server";

import { prisma } from "@/lib/prisma";
import { PartType, Prisma } from "@/lib/generated/prisma";

export type ProductSortBy = "rating" | "reviews" | "installations" | "newest";

export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  type?: PartType;
  sortBy?: ProductSortBy;
  search?: string;
}

export interface ProductListItem {
  id: string;
  type: string;
  brand: string;
  model: string;
  imageUrl: string | null;
  averageRating: number | null;
  totalReviews: number;
  totalInstallations: number;
  averageKmLifespan: number | null;
  createdAt: Date;
}

export interface GetProductsResult {
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getProducts({
  page = 1,
  pageSize = 12,
  type,
  sortBy = "installations",
  search,
}: GetProductsParams = {}): Promise<GetProductsResult> {
  const orderBy: Prisma.PartProductOrderByWithRelationInput = {
    rating: { averageRating: "desc" },
    reviews: { totalReviews: "desc" },
    installations: { totalInstallations: "desc" },
    newest: { createdAt: "desc" },
  }[sortBy] as Prisma.PartProductOrderByWithRelationInput;

  const where: Prisma.PartProductWhereInput = {
    ...(type && { type }),
    ...(search && {
      OR: [
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [rawProducts, totalCount] = await Promise.all([
    prisma.partProduct.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        type: true,
        brand: true,
        model: true,
        officialImageUrl: true,
        images: true,
        averageRating: true,
        totalReviews: true,
        totalInstallations: true,
        averageKmLifespan: true,
        createdAt: true,
        // Pobierz pierwsze zdjęcie z powiązanych części użytkowników
        bikeParts: {
          where: { images: { isEmpty: false } },
          select: { images: true },
          take: 1,
        },
        // Pobierz pierwsze zdjęcie z recenzji
        reviews: {
          where: { images: { isEmpty: false } },
          select: { images: true },
          take: 1,
        },
      },
    }),
    prisma.partProduct.count({ where }),
  ]);

  // Użyj officialImageUrl, zdjęcia produktu (admin), zdjęcia z części użytkowników lub zdjęcia z recenzji
  const products = rawProducts.map(({ bikeParts, reviews, officialImageUrl, images, ...rest }) => ({
    ...rest,
    imageUrl: officialImageUrl || images[0] || bikeParts[0]?.images[0] || reviews[0]?.images[0] || null,
  }));

  return {
    products,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

"use server";

import { prisma } from "@/lib/prisma";
import { PartType, Prisma } from "@/lib/generated/prisma";

export type ProductSortBy = "rating" | "reviews" | "installations" | "newest";

export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  type?: PartType;
  types?: PartType[];
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
  types,
  sortBy = "installations",
  search,
}: GetProductsParams = {}): Promise<GetProductsResult> {
  const orderBy: Prisma.PartProductOrderByWithRelationInput = {
    rating: { averageRating: "desc" },
    reviews: { totalReviews: "desc" },
    installations: { totalInstallations: "desc" },
    newest: { createdAt: "desc" },
  }[sortBy] as Prisma.PartProductOrderByWithRelationInput;

  const searchTerms = search ? search.trim().split(/\s+/).filter(Boolean) : [];

  const where: Prisma.PartProductWhereInput = {
    ...(type ? { type } : types?.length ? { type: { in: types } } : {}),
    ...(searchTerms.length > 0 && {
      AND: searchTerms.map((term) => ({
        OR: [
          { brand: { contains: term, mode: "insensitive" } },
          { model: { contains: term, mode: "insensitive" } },
        ],
      })),
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
        images: true,
        averageRating: true,
        totalReviews: true,
        totalInstallations: true,
        averageKmLifespan: true,
        createdAt: true,
      },
    }),
    prisma.partProduct.count({ where }),
  ]);

  const products = rawProducts.map(({ images, ...rest }) => ({
    ...rest,
    imageUrl: images[0] || null,
  }));

  return {
    products,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

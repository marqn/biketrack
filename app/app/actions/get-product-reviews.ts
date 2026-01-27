"use server";

import { prisma } from "@/lib/prisma";
import { BikeType, Prisma } from "@/lib/generated/prisma";

export type ReviewSortBy = "highest_rated" | "lowest_rated" | "newest" | "most_km";

export interface GetProductReviewsParams {
  productId: string;
  page?: number;
  pageSize?: number;
  sortBy?: ReviewSortBy;
  bikeTypeFilter?: BikeType;
}

export interface ReviewWithUser {
  id: string;
  rating: number;
  reviewText: string | null;
  pros: string[];
  cons: string[];
  kmUsed: number;
  bikeType: BikeType;
  verified: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ProductDetails {
  id: string;
  type: string;
  brand: string;
  model: string;
  averageRating: number | null;
  totalReviews: number;
  totalInstallations: number;
  averageKmLifespan: number | null;
  specifications: unknown;
}

export interface GetProductReviewsResult {
  reviews: ReviewWithUser[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  product: ProductDetails | null;
}

export async function getProductReviews({
  productId,
  page = 1,
  pageSize = 10,
  sortBy = "newest",
  bikeTypeFilter,
}: GetProductReviewsParams): Promise<GetProductReviewsResult> {
  const orderBy: Prisma.PartReviewOrderByWithRelationInput = {
    highest_rated: { rating: "desc" },
    lowest_rated: { rating: "asc" },
    newest: { createdAt: "desc" },
    most_km: { kmUsed: "desc" },
  }[sortBy] as Prisma.PartReviewOrderByWithRelationInput;

  const where: Prisma.PartReviewWhereInput = {
    productId,
    ...(bikeTypeFilter && { bikeType: bikeTypeFilter }),
  };

  const [reviews, totalCount, product] = await Promise.all([
    prisma.partReview.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        rating: true,
        reviewText: true,
        pros: true,
        cons: true,
        kmUsed: true,
        bikeType: true,
        verified: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.partReview.count({ where }),
    prisma.partProduct.findUnique({
      where: { id: productId },
      select: {
        id: true,
        type: true,
        brand: true,
        model: true,
        averageRating: true,
        totalReviews: true,
        totalInstallations: true,
        averageKmLifespan: true,
        specifications: true,
      },
    }),
  ]);

  return {
    reviews,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
    product,
  };
}

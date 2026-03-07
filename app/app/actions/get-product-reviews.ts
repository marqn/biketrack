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
  currentUserId?: string;
}

export interface ReviewWithUser {
  id: string;
  rating: number;
  reviewText: string | null;
  pros: string[];
  cons: string[];
  images: string[];
  kmUsed: number;
  bikeType: BikeType;
  verified: boolean;
  createdAt: Date;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    plan: "FREE" | "PREMIUM";
    planExpiresAt: Date | null;
  };
}

export interface ProductDetails {
  id: string;
  type: string;
  brand: string;
  model: string;
  images: string[];
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
  communityImages: string[];
}

export async function getProductReviews({
  productId,
  page = 1,
  pageSize = 10,
  sortBy = "newest",
  bikeTypeFilter,
  currentUserId,
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

  const reviewSelect = {
    id: true,
    rating: true,
    reviewText: true,
    pros: true,
    cons: true,
    images: true,
    kmUsed: true,
    bikeType: true,
    verified: true,
    createdAt: true,
    partId: true,
    serviceEventId: true,
    user: {
      select: {
        id: true,
        name: true,
        image: true,
        plan: true,
        planExpiresAt: true,
      },
    },
  } as const;

  // Pobieramy więcej recenzji, żeby po deduplikacji po userId uzyskać pełną stronę
  const fetchLimit = pageSize * 3;
  const fetchOffset = (page - 1) * pageSize;

  const [allReviews, totalCountRaw, product, partsWithImages, reviewsWithImages] = await Promise.all([
    prisma.partReview.findMany({
      where,
      orderBy,
      skip: fetchOffset,
      take: fetchLimit,
      select: reviewSelect,
    }),
    prisma.partReview.count({ where }),
    prisma.partProduct.findUnique({
      where: { id: productId },
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
        specifications: true,
      },
    }),
    prisma.bikePart.findMany({
      where: { productId, images: { isEmpty: false } },
      select: { images: true },
      take: 9,
    }),
    prisma.partReview.findMany({
      where: { productId, images: { isEmpty: false } },
      select: { images: true },
      take: 9,
    }),
  ]);

  // Deduplikacja po userId
  const seenUsers = new Set<string>();
  const reviews: typeof allReviews = [];
  for (const review of allReviews) {
    if (seenUsers.has(review.user.id)) continue;
    seenUsers.add(review.user.id);
    reviews.push(review);
    if (reviews.length >= pageSize) break;
  }

  const reviewIds = reviews.map((r) => r.id);

  // Like counts i lajki usera — dwa zapytania dla wszystkich recenzji na stronie
  const [likeCounts, userLikes] = await Promise.all([
    reviewIds.length > 0
      ? prisma.reviewLike.groupBy({
          by: ["reviewId"],
          where: { reviewId: { in: reviewIds } },
          _count: { reviewId: true },
        })
      : ([] as Array<{ reviewId: string; _count: { reviewId: number } }>),
    currentUserId && reviewIds.length > 0
      ? prisma.reviewLike.findMany({
          where: { reviewId: { in: reviewIds }, userId: currentUserId },
          select: { reviewId: true },
        })
      : ([] as Array<{ reviewId: string }>),
  ]);

  const likeCountMap = new Map(
    (likeCounts as Array<{ reviewId: string; _count: { reviewId: number } }>).map(
      (l) => [l.reviewId, l._count.reviewId]
    )
  );
  const userLikedIds = new Set(userLikes.map((l) => l.reviewId));

  // Wyciągamy partId/serviceEventId z wyników
  const reviewsClean: ReviewWithUser[] = reviews.map(
    ({ partId: _p, serviceEventId: _s, ...r }) => ({
      ...r,
      likeCount: likeCountMap.get(r.id) ?? 0,
      isLikedByCurrentUser: userLikedIds.has(r.id),
    })
  );

  const communityImages = [
    ...partsWithImages.flatMap((p) => p.images),
    ...reviewsWithImages.flatMap((r) => r.images),
  ].slice(0, 9);

  return {
    reviews: reviewsClean,
    totalCount: totalCountRaw,
    totalPages: Math.ceil(totalCountRaw / pageSize),
    currentPage: page,
    product,
    communityImages,
  };
}

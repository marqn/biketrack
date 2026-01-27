"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { BikeType } from "@/lib/generated/prisma";

export interface AddProductReviewInput {
  productId: string;
  rating: number;
  reviewText?: string;
  pros?: string[];
  cons?: string[];
  bikeType: BikeType;
}

export async function addProductReview(data: AddProductReviewInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Musisz być zalogowany, aby dodać opinię");
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Ocena musi być w zakresie 1-5");
  }

  const product = await prisma.partProduct.findUnique({
    where: { id: data.productId },
  });
  if (!product) {
    throw new Error("Produkt nie istnieje");
  }

  const userBike = await prisma.bike.findFirst({
    where: { userId: session.user.id },
  });

  // Szukamy istniejącej opinii użytkownika o tym produkcie (bez powiązania z częścią)
  const existingReview = await prisma.partReview.findFirst({
    where: {
      userId: session.user.id,
      productId: data.productId,
      partId: null,
      serviceEventId: null,
    },
  });

  if (existingReview) {
    await prisma.partReview.update({
      where: { id: existingReview.id },
      data: {
        rating: data.rating,
        reviewText: data.reviewText || null,
        pros: data.pros || [],
        cons: data.cons || [],
        bikeType: data.bikeType,
      },
    });
  } else {
    await prisma.partReview.create({
      data: {
        userId: session.user.id,
        productId: data.productId,
        rating: data.rating,
        reviewText: data.reviewText || null,
        pros: data.pros || [],
        cons: data.cons || [],
        kmUsed: 0,
        kmAtReview: userBike?.totalKm || 0,
        bikeType: data.bikeType,
        verified: false,
      },
    });
  }

  await updateProductStats(data.productId);

  revalidatePath(`/app/products/${data.productId}/reviews`);
  revalidatePath("/app/products");
  revalidatePath("/");
}

async function updateProductStats(productId: string) {
  const stats = await prisma.partReview.aggregate({
    where: { productId },
    _avg: { rating: true, kmUsed: true },
    _count: { id: true },
  });

  await prisma.partProduct.update({
    where: { id: productId },
    data: {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.id,
      averageKmLifespan: Math.round(stats._avg.kmUsed || 0),
    },
  });
}

export async function getUserProductReview(productId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const review = await prisma.partReview.findFirst({
    where: {
      userId: session.user.id,
      productId,
      partId: null,
      serviceEventId: null,
    },
    select: {
      id: true,
      rating: true,
      reviewText: true,
      pros: true,
      cons: true,
      bikeType: true,
    },
  });

  return review;
}

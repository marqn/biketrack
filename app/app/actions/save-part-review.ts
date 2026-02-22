"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function savePartReview({
  partId,
  productId,
  rating,
  reviewText,
}: {
  partId: string;
  productId: string;
  rating: number;
  reviewText?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const part = await prisma.bikePart.findUnique({
    where: { id: partId },
    include: { bike: true },
  });
  if (!part) throw new Error("Part not found");
  if (part.bike.userId !== session.user.id) throw new Error("Forbidden");

  const existingReview = await prisma.partReview.findUnique({
    where: {
      userId_partId: {
        userId: session.user.id,
        partId,
      },
    },
  });

  if (existingReview) {
    await prisma.partReview.update({
      where: { id: existingReview.id },
      data: {
        rating,
        reviewText,
        kmAtReview: part.bike.totalKm,
        kmUsed: part.wearKm,
      },
    });
  } else {
    await prisma.partReview.create({
      data: {
        userId: session.user.id,
        partId,
        productId,
        rating,
        reviewText,
        pros: [],
        cons: [],
        kmAtReview: part.bike.totalKm,
        kmUsed: part.wearKm,
        bikeType: part.bike.type,
      },
    });
  }

  const stats = await prisma.partReview.aggregate({
    where: { productId, verified: true },
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

  revalidatePath("/app");
}

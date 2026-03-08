"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function deleteProductReview(reviewId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Musisz być zalogowany");
  }

  const review = await prisma.partReview.findUnique({
    where: { id: reviewId },
    select: { userId: true, productId: true },
  });

  if (!review) throw new Error("Opinia nie istnieje");
  if (review.userId !== session.user.id) throw new Error("Brak uprawnień");

  await prisma.partReview.delete({ where: { id: reviewId } });

  await updateProductStats(review.productId);

  revalidatePath(`/app/products/${review.productId}/reviews`);
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

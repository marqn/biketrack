"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function toggleReviewLike(reviewId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    const review = await prisma.partReview.findUnique({
      where: { id: reviewId },
      select: { userId: true },
    });

    if (!review) {
      return { success: false, error: "Opinia nie istnieje" };
    }

    if (review.userId === session.user.id) {
      return { success: false, error: "Nie możesz polubić własnej opinii" };
    }

    const existing = await prisma.reviewLike.findUnique({
      where: { reviewId_userId: { reviewId, userId: session.user.id } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.reviewLike.delete({
        where: { reviewId_userId: { reviewId, userId: session.user.id } },
      });
      liked = false;
    } else {
      await prisma.reviewLike.create({
        data: { reviewId, userId: session.user.id },
      });
      liked = true;
    }

    const likeCount = await prisma.reviewLike.count({ where: { reviewId } });

    return { success: true, liked, likeCount };
  } catch (error) {
    console.error("Error toggling review like:", error);
    return { success: false, error: "Wystąpił błąd" };
  }
}

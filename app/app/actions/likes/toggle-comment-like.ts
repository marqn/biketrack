"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function toggleCommentLike(commentId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    const comment = await prisma.bikeComment.findUnique({
      where: { id: commentId },
      select: { userId: true, isHidden: true },
    });

    if (!comment || comment.isHidden) {
      return { success: false, error: "Komentarz nie istnieje" };
    }

    if (comment.userId === session.user.id) {
      return { success: false, error: "Nie możesz polubić własnego komentarza" };
    }

    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId: session.user.id } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.commentLike.delete({
        where: { commentId_userId: { commentId, userId: session.user.id } },
      });
      liked = false;
    } else {
      await prisma.commentLike.create({
        data: { commentId, userId: session.user.id },
      });
      liked = true;
    }

    const likeCount = await prisma.commentLike.count({ where: { commentId } });

    return { success: true, liked, likeCount };
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return { success: false, error: "Wystąpił błąd" };
  }
}

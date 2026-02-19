"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function deleteComment(commentId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const comment = await prisma.bikeComment.findUnique({
      where: { id: commentId },
      include: {
        bike: { select: { slug: true } },
      },
    });

    if (!comment) {
      return { success: false, error: "Komentarz nie został znaleziony" };
    }

    // Tylko autor lub admin może usunąć
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (comment.userId !== session.user.id && user?.role !== "ADMIN") {
      return { success: false, error: "Brak uprawnień" };
    }

    // Soft delete
    await prisma.bikeComment.update({
      where: { id: commentId },
      data: { isHidden: true },
    });

    if (comment.bike.slug) {
      revalidatePath(`/app/discover/bike/${comment.bike.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "Wystąpił błąd" };
  }
}

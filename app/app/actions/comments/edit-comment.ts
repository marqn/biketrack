"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { revalidatePath } from "next/cache";

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export async function editComment({
  commentId,
  content,
  type,
}: {
  commentId: string;
  content: string;
  type?: "GENERAL" | "SUGGESTION" | "QUESTION";
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const trimmed = stripHtml(content);
    if (!trimmed || trimmed.length > 2000) {
      return { success: false, error: "Komentarz musi mieć 1–2000 znaków" };
    }

    const comment = await prisma.bikeComment.findUnique({
      where: { id: commentId },
      include: { bike: { select: { slug: true } } },
    });

    if (!comment) {
      return { success: false, error: "Komentarz nie został znaleziony" };
    }

    if (comment.userId !== session.user.id) {
      return { success: false, error: "Brak uprawnień" };
    }

    await prisma.bikeComment.update({
      where: { id: commentId },
      data: {
        content: trimmed,
        // typ tylko dla komentarzy głównych (nie odpowiedzi)
        ...(type && !comment.parentId ? { type } : {}),
      },
    });

    if (comment.bike.slug) {
      revalidatePath(`/app/discover/bike/${comment.bike.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error editing comment:", error);
    return { success: false, error: "Wystąpił błąd" };
  }
}

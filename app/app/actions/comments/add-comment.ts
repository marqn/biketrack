"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { addCommentSchema } from "@/lib/validation/social";
import { CommentType } from "@/lib/generated/prisma";

const MAX_COMMENTS_PER_HOUR = 20;

export async function addComment(input: {
  bikeId: string;
  content: string;
  type: string;
  parentId?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Musisz być zalogowany, aby komentować" };
    }

    const parsed = addCommentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane" };
    }

    const { bikeId, content, type, parentId } = parsed.data;

    // Sprawdź czy rower jest publiczny
    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
      select: { id: true, isPublic: true, userId: true, slug: true, brand: true, model: true },
    });

    if (!bike || !bike.isPublic) {
      return { success: false, error: "Rower nie jest publiczny" };
    }

    // Rate limiting - max komentarzy na godzinę
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.bikeComment.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= MAX_COMMENTS_PER_HOUR) {
      return { success: false, error: "Zbyt wiele komentarzy. Spróbuj ponownie za chwilę." };
    }

    // Jeśli to odpowiedź, sprawdź czy rodzic istnieje
    if (parentId) {
      const parent = await prisma.bikeComment.findUnique({
        where: { id: parentId },
        select: { id: true, bikeId: true, userId: true },
      });
      if (!parent || parent.bikeId !== bikeId) {
        return { success: false, error: "Komentarz nadrzędny nie istnieje" };
      }
    }

    const comment = await prisma.bikeComment.create({
      data: {
        bikeId,
        userId: session.user.id,
        content,
        type: type as CommentType,
        parentId: parentId ?? null,
      },
    });

    // Notyfikacja dla właściciela roweru (jeśli komentujący != właściciel)
    if (bike.userId !== session.user.id) {
      const bikeName = bike.brand || bike.model
        ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
        : "Twój rower";

      const typeLabel = type === "SUGGESTION" ? "sugestię" : type === "QUESTION" ? "pytanie" : "komentarz";

      await prisma.notification.create({
        data: {
          userId: bike.userId,
          type: "NEW_COMMENT",
          title: type === "SUGGESTION" ? "Nowa sugestia" : type === "QUESTION" ? "Nowe pytanie" : "Nowy komentarz",
          message: `${session.user.name ?? "Ktoś"} dodał(a) ${typeLabel} do roweru ${bikeName}`,
          bikeId: bike.id,
          commentId: comment.id,
        },
      });
    }

    // Notyfikacja dla autora komentarza nadrzędnego (jeśli to odpowiedź)
    if (parentId) {
      const parent = await prisma.bikeComment.findUnique({
        where: { id: parentId },
        select: { userId: true },
      });

      if (parent && parent.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: parent.userId,
            type: "COMMENT_REPLY",
            title: "Nowa odpowiedź",
            message: `${session.user.name ?? "Ktoś"} odpowiedział(a) na Twój komentarz`,
            bikeId: bike.id,
            commentId: comment.id,
          },
        });
      }
    }

    revalidatePath(`/app/discover/bike/${bike.slug}`);

    return { success: true, commentId: comment.id };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: "Wystąpił błąd podczas dodawania komentarza" };
  }
}

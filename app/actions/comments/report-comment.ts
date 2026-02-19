"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { reportCommentSchema } from "@/lib/validation/social";
import { ReportReason } from "@/lib/generated/prisma";

const AUTO_HIDE_THRESHOLD = 3;

export async function reportComment(input: {
  commentId: string;
  reason: string;
  details?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    const parsed = reportCommentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane" };
    }

    const { commentId, reason, details } = parsed.data;

    const comment = await prisma.bikeComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, isHidden: true },
    });

    if (!comment || comment.isHidden) {
      return { success: false, error: "Komentarz nie został znaleziony" };
    }

    // Nie można zgłosić własnego komentarza
    if (comment.userId === session.user.id) {
      return { success: false, error: "Nie możesz zgłosić własnego komentarza" };
    }

    // Sprawdź czy już zgłoszono (unique constraint)
    const existing = await prisma.commentReport.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return { success: false, error: "Już zgłosiłeś ten komentarz" };
    }

    await prisma.commentReport.create({
      data: {
        commentId,
        userId: session.user.id,
        reason: reason as ReportReason,
        details: details ?? null,
      },
    });

    // Auto-hide jeśli liczba zgłoszeń >= threshold
    const reportCount = await prisma.commentReport.count({
      where: { commentId },
    });

    if (reportCount >= AUTO_HIDE_THRESHOLD) {
      await prisma.bikeComment.update({
        where: { id: commentId },
        data: { isHidden: true },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error reporting comment:", error);
    return { success: false, error: "Wystąpił błąd podczas zgłaszania" };
  }
}

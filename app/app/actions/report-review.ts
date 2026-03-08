"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReportReason } from "@/lib/generated/prisma";

export async function reportReview(input: {
  reviewId: string;
  reason: string;
  details?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    const review = await prisma.partReview.findUnique({
      where: { id: input.reviewId },
      select: { id: true, userId: true },
    });

    if (!review) {
      return { success: false, error: "Opinia nie została znaleziona" };
    }

    if (review.userId === session.user.id) {
      return { success: false, error: "Nie możesz zgłosić własnej opinii" };
    }

    const existing = await prisma.reviewReport.findUnique({
      where: { reviewId_userId: { reviewId: input.reviewId, userId: session.user.id } },
    });

    if (existing) {
      return { success: false, error: "Już zgłosiłeś tę opinię" };
    }

    await prisma.reviewReport.create({
      data: {
        reviewId: input.reviewId,
        userId: session.user.id,
        reason: input.reason as ReportReason,
        details: input.details ?? null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error reporting review:", error);
    return { success: false, error: "Wystąpił błąd podczas zgłaszania" };
  }
}

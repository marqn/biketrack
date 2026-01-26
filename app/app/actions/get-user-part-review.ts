"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function getUserPartReview(productId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const review = await prisma.partReview.findFirst({
    where: {
      userId: session.user.id,
      productId,
      serviceEventId: null, // Tylko opinie o częściach (nie smarach)
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      reviewText: true,
    },
  });

  return review;
}

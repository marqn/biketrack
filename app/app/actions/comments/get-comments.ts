"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";

const commentInclude = {
  user: {
    select: { id: true, name: true, image: true },
  },
  replies: {
    where: { isHidden: false },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { likes: true },
      },
    },
    orderBy: { createdAt: "asc" },
  },
  _count: {
    select: { reports: true, likes: true },
  },
} satisfies Prisma.BikeCommentInclude;

type CommentWithIncludes = Prisma.BikeCommentGetPayload<{
  include: typeof commentInclude;
}>;

export async function getComments({
  bikeId,
  page = 1,
  pageSize = 10,
  currentUserId,
}: {
  bikeId: string;
  page?: number;
  pageSize?: number;
  currentUserId?: string;
}) {
  try {
    const skip = (page - 1) * pageSize;

    const comments = (await prisma.bikeComment.findMany({
      where: {
        bikeId,
        isHidden: false,
        parentId: null,
      },
      include: commentInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    })) as unknown as CommentWithIncludes[];

    const totalCount = await prisma.bikeComment.count({
      where: {
        bikeId,
        isHidden: false,
        parentId: null,
      },
    });

    // Zbierz wszystkie ID komentarzy i odpowiedzi
    const allCommentIds = [
      ...comments.map((c) => c.id),
      ...comments.flatMap((c) => c.replies.map((r) => r.id)),
    ];

    // Jedno zapytanie o lajki bieżącego użytkownika
    const userLikedIds = new Set<string>();
    if (currentUserId && allCommentIds.length > 0) {
      const userLikes = await prisma.commentLike.findMany({
        where: { commentId: { in: allCommentIds }, userId: currentUserId },
        select: { commentId: true },
      });
      userLikes.forEach((l) => userLikedIds.add(l.commentId));
    }

    // Reputacja autorów — jedno zapytanie SQL dla wszystkich na stronie
    const authorIds = [
      ...new Set([
        ...comments.map((c) => c.user.id),
        ...comments.flatMap((c) => c.replies.map((r) => r.user.id)),
      ]),
    ];

    const reputationMap = new Map<string, number>();
    if (authorIds.length > 0) {
      const reputations = await prisma.$queryRaw<Array<{ userId: string; count: bigint }>>(
        Prisma.sql`
          SELECT bc."userId", COUNT(cl.id) as count
          FROM "BikeComment" bc
          LEFT JOIN "CommentLike" cl ON cl."commentId" = bc.id
          WHERE bc."userId" = ANY(${authorIds}::text[])
            AND bc."isHidden" = false
          GROUP BY bc."userId"
        `
      );
      reputations.forEach((r) => reputationMap.set(r.userId, Number(r.count)));
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    const serialized = comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      likeCount: c._count.likes,
      isLikedByCurrentUser: userLikedIds.has(c.id),
      user: { ...c.user, reputation: reputationMap.get(c.user.id) ?? 0 },
      replies: c.replies.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        likeCount: r._count.likes,
        isLikedByCurrentUser: userLikedIds.has(r.id),
        user: { ...r.user, reputation: reputationMap.get(r.user.id) ?? 0 },
      })),
    }));

    return {
      success: true,
      comments: serialized,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { success: false, comments: [], totalCount: 0, totalPages: 0, currentPage: page };
  }
}

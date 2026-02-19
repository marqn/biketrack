"use server";

import { prisma } from "@/lib/prisma";

export async function getComments({
  bikeId,
  page = 1,
  pageSize = 10,
}: {
  bikeId: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const skip = (page - 1) * pageSize;

    const [comments, totalCount] = await Promise.all([
      prisma.bikeComment.findMany({
        where: {
          bikeId,
          isHidden: false,
          parentId: null, // Tylko komentarze główne
        },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          replies: {
            where: { isHidden: false },
            include: {
              user: {
                select: { id: true, name: true, image: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: {
            select: { reports: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.bikeComment.count({
        where: {
          bikeId,
          isHidden: false,
          parentId: null,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    // Serializuj daty do stringów
    const serialized = comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      replies: c.replies.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
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

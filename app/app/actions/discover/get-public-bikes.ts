"use server";

import { prisma } from "@/lib/prisma";
import { BikeType } from "@/lib/generated/prisma";
import { unstable_cache } from "next/cache";

interface GetPublicBikesParams {
  page?: number;
  pageSize?: number;
  type?: BikeType | null;
  search?: string;
  sortBy?: "newest" | "mostKm" | "mostComments";
}

const fetchPublicBikes = unstable_cache(
  async (page: number, pageSize: number, type: string, search: string, sortBy: string) => {
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { isPublic: true };

    if (type && type !== "null") {
      where.type = type;
    }

    if (search.trim()) {
      where.OR = [
        { brand: { contains: search.trim(), mode: "insensitive" } },
        { model: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, unknown> = {};
    switch (sortBy) {
      case "mostKm":
        orderBy = { totalKm: "desc" };
        break;
      case "mostComments":
        orderBy = { comments: { _count: "desc" } };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    const [bikes, totalCount] = await Promise.all([
      prisma.bike.findMany({
        where,
        select: {
          slug: true,
          brand: true,
          model: true,
          year: true,
          type: true,
          isElectric: true,
          totalKm: true,
          images: true,
          imageUrl: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          _count: {
            select: { comments: { where: { isHidden: false, parentId: null } } },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.bike.count({ where }),
    ]);

    return { bikes, totalCount };
  },
  ["public-bikes-list"],
  { revalidate: 30, tags: ["public-bikes-list"] }
);

export async function getPublicBikes({
  page = 1,
  pageSize = 12,
  type = null,
  search = "",
  sortBy = "newest",
}: GetPublicBikesParams) {
  try {
    const { bikes, totalCount } = await fetchPublicBikes(
      page,
      pageSize,
      String(type),
      search,
      sortBy
    );

    return {
      success: true,
      bikes,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching public bikes:", error);
    return { success: false, bikes: [], totalCount: 0, totalPages: 0, currentPage: page };
  }
}

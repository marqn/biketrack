"use server";

import { prisma } from "@/lib/prisma";

export interface LandingStats {
  totalBikes: number;
  totalUsers: number;
  totalKmTracked: number;
  totalReplacements: number;
  totalReviews: number;

  popularBikeBrand: {
    brand: string;
    count: number;
  } | null;

  bikeTypeDistribution: Array<{
    type: string;
    count: number;
  }>;

  popularPartType: {
    type: string;
    count: number;
  } | null;

  mostReplacedPart: {
    type: string;
    count: number;
    avgKmUsed: number;
  } | null;
}

export async function getLandingStats(): Promise<LandingStats> {
  const [
    totalBikes,
    totalUsers,
    kmAgg,
    totalReplacements,
    totalReviews,
    bikesByBrand,
    bikesByType,
    partsByType,
    mostReplacedPart,
  ] = await Promise.all([
    prisma.bike.count(),
    prisma.user.count(),
    prisma.bike.aggregate({ _sum: { totalKm: true } }),
    prisma.partReplacement.count(),
    prisma.partReview.count(),
    prisma.bike.groupBy({
      by: ["brand"],
      where: { brand: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    prisma.bike.groupBy({
      by: ["type"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.bikePart.groupBy({
      by: ["type"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    prisma.partReplacement.groupBy({
      by: ["partType"],
      _count: { id: true },
      _avg: { kmUsed: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
  ]);

  return {
    totalBikes,
    totalUsers,
    totalKmTracked: kmAgg._sum.totalKm || 0,
    totalReplacements,
    totalReviews,
    popularBikeBrand:
      bikesByBrand.length > 0
        ? { brand: bikesByBrand[0].brand!, count: bikesByBrand[0]._count.id }
        : null,
    bikeTypeDistribution: bikesByType.map((b) => ({
      type: b.type,
      count: b._count.id,
    })),
    popularPartType:
      partsByType.length > 0
        ? { type: partsByType[0].type, count: partsByType[0]._count.id }
        : null,
    mostReplacedPart:
      mostReplacedPart.length > 0
        ? {
            type: mostReplacedPart[0].partType,
            count: mostReplacedPart[0]._count.id,
            avgKmUsed: Math.round(mostReplacedPart[0]._avg.kmUsed || 0),
          }
        : null,
  };
}

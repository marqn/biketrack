"use server";

import { prisma } from "@/lib/prisma";
import { ServiceType } from "@/lib/generated/prisma";

export async function searchLubricantBrands(query: string): Promise<string[]> {
  if (query.length < 1) return [];

  const results = await prisma.serviceEvent.findMany({
    where: {
      type: ServiceType.CHAIN_LUBE,
      lubricantBrand: {
        not: null,
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      lubricantBrand: true,
    },
    distinct: ["lubricantBrand"],
    orderBy: {
      lubricantBrand: "asc",
    },
    take: 10,
  });

  return results
    .map((r) => r.lubricantBrand)
    .filter((brand): brand is string => brand !== null);
}

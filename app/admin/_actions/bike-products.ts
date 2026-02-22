"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { BikeType, PartType } from "@/lib/generated/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") throw new Error("Forbidden");
  return session.user.id;
}

export async function getBikeProducts(params: {
  page?: number;
  search?: string;
  bikeType?: BikeType;
  all?: boolean;
}) {
  const pageSize = 20;
  const page = params.page || 1;

  const where = {
    ...(params.bikeType && { bikeType: params.bikeType }),
    ...(params.search && {
      OR: [
        { brand: { contains: params.search, mode: "insensitive" as const } },
        { model: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  if (params.all) {
    const products = await prisma.bikeProduct.findMany({
      where,
      include: {
        defaultParts: {
          include: { partProduct: true },
        },
      },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    });
    return { products, total: products.length, totalPages: 1 };
  }

  const [products, total] = await Promise.all([
    prisma.bikeProduct.findMany({
      where,
      include: {
        defaultParts: {
          include: { partProduct: true },
        },
      },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.bikeProduct.count({ where }),
  ]);

  return { products, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getBikeProduct(id: string) {
  return prisma.bikeProduct.findUnique({
    where: { id },
    include: {
      defaultParts: {
        include: { partProduct: true },
      },
    },
  });
}

export async function createBikeProduct(data: {
  bikeType: BikeType;
  brand: string;
  model: string;
  year?: number | null;
  description?: string | null;
  officialImageUrl?: string | null;
  isElectric?: boolean;
  isPublic?: boolean;
}) {
  await requireAdmin();

  const product = await prisma.bikeProduct.create({
    data: {
      bikeType: data.bikeType,
      brand: data.brand.trim().toUpperCase(),
      model: data.model.trim(),
      year: data.year || undefined,
      description: data.description || undefined,
      officialImageUrl: data.officialImageUrl || undefined,
      isElectric: data.isElectric ?? false,
      isPublic: data.isPublic ?? true,
    },
  });

  revalidatePath("/admin/bikes");
  return product;
}

export async function updateBikeProduct(
  id: string,
  data: {
    bikeType?: BikeType;
    brand?: string;
    model?: string;
    year?: number | null;
    description?: string | null;
    officialImageUrl?: string | null;
    isElectric?: boolean;
    isPublic?: boolean;
  }
) {
  await requireAdmin();

  const product = await prisma.bikeProduct.update({
    where: { id },
    data: {
      ...data,
      brand: data.brand?.trim().toUpperCase(),
      model: data.model?.trim(),
    },
  });

  revalidatePath("/admin/bikes");
  revalidatePath(`/admin/bikes/${id}`);
  return product;
}

export async function deleteBikeProduct(id: string) {
  await requireAdmin();

  await prisma.bikeProduct.delete({ where: { id } });

  revalidatePath("/admin/bikes");
}

export async function setDefaultParts(
  bikeProductId: string,
  parts: Array<{
    partType: PartType;
    partProductId: string;
    expectedKm: number;
  }>
) {
  await requireAdmin();

  await prisma.$transaction(async (tx) => {
    await tx.bikeProductDefaultPart.deleteMany({
      where: { bikeProductId },
    });

    if (parts.length > 0) {
      await tx.bikeProductDefaultPart.createMany({
        data: parts.map((p) => ({
          bikeProductId,
          partProductId: p.partProductId,
          partType: p.partType,
          expectedKm: p.expectedKm,
        })),
      });
    }
  });

  revalidatePath(`/admin/bikes/${bikeProductId}`);
}

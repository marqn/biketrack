"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { PartType, Prisma } from "@/lib/generated/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") throw new Error("Forbidden");
}

export async function getPartProducts(params: {
  page?: number;
  search?: string;
  type?: PartType;
  all?: boolean;
}) {
  const pageSize = 20;
  const page = params.page || 1;

  const where = {
    ...(params.type && { type: params.type }),
    ...(params.search && {
      OR: [
        { brand: { contains: params.search, mode: "insensitive" as const } },
        { model: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.partProduct.findMany({
      where,
      orderBy: [{ type: "asc" }, { brand: "asc" }, { model: "asc" }, { createdAt: "desc" }],
      ...(params.all ? {} : { skip: (page - 1) * pageSize, take: pageSize }),
    }),
    prisma.partProduct.count({ where }),
  ]);

  return { products, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getPartProduct(id: string) {
  return prisma.partProduct.findUnique({
    where: { id },
  });
}

export async function createPartProduct(data: {
  type: PartType;
  brand: string;
  model: string;
  description?: string | null;
  specifications?: Record<string, unknown> | null;
}) {
  await requireAdmin();

  const product = await prisma.partProduct.create({
    data: {
      type: data.type,
      brand: data.brand.trim(),
      model: data.model.trim(),
      description: data.description || undefined,
      specifications: (data.specifications as Prisma.InputJsonValue) || undefined,
    },
  });

  revalidatePath("/admin/parts");
  return product;
}

export async function updatePartProduct(
  id: string,
  data: {
    type?: PartType;
    brand?: string;
    model?: string;
    specifications?: Record<string, unknown> | null;
    officialPrice?: number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    averageKmLifespan?: number | null;
    totalInstallations?: number | null;
  }
) {
  await requireAdmin();

  const product = await prisma.partProduct.update({
    where: { id },
    data: {
      type: data.type,
      brand: data.brand?.trim(),
      model: data.model?.trim(),
      specifications: (data.specifications as Prisma.InputJsonValue) ?? undefined,
      officialPrice: data.officialPrice,
      averageRating: data.averageRating,
      totalReviews: data.totalReviews ?? undefined,
      averageKmLifespan: data.averageKmLifespan ?? undefined,
      totalInstallations: data.totalInstallations ?? undefined,
    },
  });

  revalidatePath("/admin/parts");
  revalidatePath(`/admin/parts/${id}`);
  return product;
}

export async function deletePartProduct(id: string) {
  await requireAdmin();

  await prisma.partProduct.delete({ where: { id } });

  revalidatePath("/admin/parts");
}

export async function getPartReviews(productId: string) {
  return prisma.partReview.findMany({
    where: { productId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deletePartReview(id: string) {
  await requireAdmin();

  await prisma.partReview.delete({ where: { id } });

  revalidatePath("/admin/parts");
}

export async function searchPartProducts(partType: PartType, query: string) {
  const relatedTypes = getRelatedPartTypes(partType);

  return prisma.partProduct.findMany({
    where: {
      type: { in: relatedTypes },
      OR: [
        { brand: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    take: 20,
  });
}

function getRelatedPartTypes(partType: PartType): PartType[] {
  if (partType === PartType.TIRE_FRONT || partType === PartType.TIRE_REAR) {
    return [PartType.TIRE_FRONT, PartType.TIRE_REAR];
  }
  if (partType === PartType.PADS_FRONT || partType === PartType.PADS_REAR) {
    return [PartType.PADS_FRONT, PartType.PADS_REAR];
  }
  return [partType];
}

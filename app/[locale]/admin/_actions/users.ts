"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { UserRole, Plan } from "@/lib/generated/prisma";

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

export async function getUsers(params: {
  search?: string;
  role?: UserRole;
  plan?: Plan;
}) {
  const where = {
    ...(params.role && { role: params.role }),
    ...(params.plan && { plan: params.plan }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { email: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      plan: true,
      createdAt: true,
      _count: {
        select: {
          bikes: true,
          bikeComments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      plan: true,
      planExpiresAt: true,
      weight: true,
      bio: true,
      profileSlug: true,
      lastStravaSync: true,
      createdAt: true,
      _count: {
        select: {
          bikes: true,
          bikeComments: true,
          partReviews: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    ...user,
    planExpiresAt: user.planExpiresAt?.toISOString() ?? null,
    lastStravaSync: user.lastStravaSync?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getUserBikes(userId: string) {
  const bikes = await prisma.bike.findMany({
    where: { userId },
    select: {
      id: true,
      brand: true,
      model: true,
      type: true,
      year: true,
      isPublic: true,
      isElectric: true,
      totalKm: true,
      slug: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return bikes.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));
}

export async function getUserComments(userId: string) {
  const comments = await prisma.bikeComment.findMany({
    where: { userId },
    include: {
      bike: {
        select: { id: true, brand: true, model: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return comments.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function updateUser(
  id: string,
  data: {
    name?: string | null;
    email?: string | null;
    role?: UserRole;
    plan?: Plan;
    planExpiresAt?: string | null;
    weight?: number | null;
    bio?: string | null;
    profileSlug?: string | null;
  }
) {
  await requireAdmin();

  await prisma.user.update({
    where: { id },
    data: {
      name: data.name?.trim() || null,
      email: data.email?.trim() || null,
      role: data.role,
      plan: data.plan,
      planExpiresAt: data.planExpiresAt ? new Date(data.planExpiresAt) : null,
      weight: data.weight,
      bio: data.bio?.trim() || null,
      profileSlug: data.profileSlug?.trim() || null,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function deleteUser(id: string) {
  const adminId = await requireAdmin();

  if (id === adminId) {
    throw new Error("Nie możesz usunąć swojego konta");
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/users");
}

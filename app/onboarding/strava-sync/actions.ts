"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BikeType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS } from "@/lib/default-parts";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface CreateBikeParams {
  type: BikeType;
  brand?: string | null;
  model?: string | null;
  totalKm?: number | null;
}

export async function createBike({ 
  type, 
  brand, 
  model, 
  totalKm 
}: CreateBikeParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { bikes: true },
  });

  if (!user) redirect("/login");

  // 🔥 KLUCZ: user ma już rower → NIE TWORZYMY
  if (user.bikes.length > 0) {
    redirect("/app");
  }

  const initialKm = totalKm || 0;

  await prisma.bike.create({
    data: {
      type,
      brand: brand || undefined,
      model: model || undefined,
      totalKm: initialKm,
      userId: user.id,
      parts: {
        create: DEFAULT_PARTS[type].map(part => ({
          ...part,
          wearKm: initialKm,
        })),
      },
    },
  });

  redirect("/app");
}
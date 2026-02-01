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
}

export async function createBike({ type, brand, model }: CreateBikeParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { bikes: true },
  });

  if (!user) redirect("/login");

  if (user.bikes.length > 0) {
    redirect("/app");
  }

  // Jeśli użytkownik podał markę i model, dodaj do BikeProduct jeśli nie istnieje
  if (brand && model) {
    await prisma.bikeProduct.upsert({
      where: {
        bikeType_brand_model: {
          bikeType: type,
          brand: brand.trim(),
          model: model.trim(),
        },
      },
      update: {}, // Nic nie aktualizuj jeśli już istnieje
      create: {
        bikeType: type,
        brand: brand.trim(),
        model: model.trim(),
      },
    });
  }

  await prisma.bike.create({
    data: {
      type,
      brand: brand || undefined,
      model: model || undefined,
      userId: user.id,
      parts: {
        create: DEFAULT_PARTS[type],
      },
    },
  });

  redirect("/app");
}

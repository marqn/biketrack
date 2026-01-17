	"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BikeType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS } from "@/lib/default-parts";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";



export async function createBike(type: BikeType) {
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

  await prisma.bike.create({
    data: {
      type,
      name: `${type} Bike`,
      userId: user.id,
      parts: {
        create: DEFAULT_PARTS[type],
      },
    },
  });

  redirect("/app");
}

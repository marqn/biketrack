"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function lubeChain() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { bikes: true },
  });

  if (!user || user.bikes.length === 0) redirect("/onboarding");

  const bike = user.bikes[0];

  await prisma.serviceEvent.create({
    data: {
      type: "CHAIN_LUBE",
      kmAtTime: bike.totalKm,
      bikeId: bike.id,
    },
  });

  redirect("/app");
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function lubeChain() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;

  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { bikes: true },
  });
  
  console.log("user.bikes:", user.bikes);
  console.log("Pierwszy rower:", user.bikes[0]);
  
  if (!user?.bikes) return;

  await prisma.serviceEvent.create({
    data: {
      bikeId: user.bikes.id,
      type: "CHAIN_LUBE",
      kmAtTime: user.bikes.totalKm,
    },
  });

  redirect("/app");
}

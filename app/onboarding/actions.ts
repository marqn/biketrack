"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const DEFAULT_PARTS = {
  ROAD: [
    { type: "CHAIN", expectedKm: 2500 },
    { type: "CASSETTE", expectedKm: 8000 },
    { type: "PADS_FRONT", expectedKm: 3000 },
    { type: "PADS_REAR", expectedKm: 3000 },
  ],
  GRAVEL: [
    { type: "CHAIN", expectedKm: 2000 },
    { type: "CASSETTE", expectedKm: 6000 },
    { type: "PADS_FRONT", expectedKm: 2500 },
    { type: "PADS_REAR", expectedKm: 2500 },
  ],
  MTB: [
    { type: "CHAIN", expectedKm: 1800 },
    { type: "CASSETTE", expectedKm: 5000 },
    { type: "PADS_FRONT", expectedKm: 2000 },
    { type: "PADS_REAR", expectedKm: 2000 },
  ],
};

export async function createBike(type: "ROAD" | "GRAVEL" | "MTB" | "OTHER") {
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
      userId: user.id,
      parts: {
        create: DEFAULT_PARTS[type],
      },
    },
  });

  redirect("/app");
}

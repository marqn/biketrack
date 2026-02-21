"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function updateUnitPreference(unit: "METRIC" | "IMPERIAL") {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.user.update({
    where: { id: session.user.id },
    data: { unitPreference: unit },
  })
}

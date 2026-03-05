"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function updateUnitPreference(unit: "METRIC" | "IMPERIAL") {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { unitPreference: unit },
    })
  } catch (e: any) {
    if (e?.code === "P2025") {
      redirect("/login")
    }
    throw e
  }
}

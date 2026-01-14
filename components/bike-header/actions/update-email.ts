"use server"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getServerSession } from "next-auth";

const schema = z.object({
  email: z.string().email(),
})

export async function updateEmail(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    throw new Error("Invalid email")
  }

  const { email } = parsed.data
  const userId = session.user.id

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { email },
    }),

    prisma.notification.updateMany({
      where: {
        userId,
        type: "EMAIL_MISSING",
        status: { in: ["UNREAD", "READ"] },
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    }),
  ])

  revalidatePath("/app")
}

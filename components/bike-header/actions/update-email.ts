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
    return {
      success: false,
      error: "Musisz być zalogowany"
    }
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: "Nieprawidłowy format adresu email"
    }
  }

  const { email } = parsed.data
  const userId = session.user.id

  // Sprawdź czy email już istnieje
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  // Jeśli email należy do innego użytkownika, zwróć błąd
  if (existingUser && existingUser.id !== userId) {
    return {
      success: false,
      error: "Ten adres email jest już używany przez inne konto"
    }
  }

  try {
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
    
    return {
      success: true
    }
  } catch (error) {
    console.error("Error updating email:", error)
    return {
      success: false,
      error: "Wystąpił błąd podczas zapisywania adresu email"
    }
  }
}

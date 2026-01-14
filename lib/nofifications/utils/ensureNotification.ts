import { NotificationType } from "@/lib/generated/prisma"
import { prisma } from "@/lib/prisma"

type EnsureArgs = {
  userId: string
  type: NotificationType
  title: string
  message: string
  bikeId?: string
  partId?: string
}

export async function ensureNotification({
  userId,
  type,
  title,
  message,
  bikeId,
  partId,
}: EnsureArgs) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      bikeId,
      partId,
      status: "UNREAD", // <- Zmienione: tylko UNREAD
    },
  })

  if (existing) return null

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      bikeId,
      partId,
    },
  })
}

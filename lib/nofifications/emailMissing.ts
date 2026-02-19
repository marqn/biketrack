import { prisma } from "@/lib/prisma"

export async function ensureEmailMissingNotification(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  if (user?.email) return

  const exists = await prisma.notification.findFirst({
    where: {
      userId,
      type: "EMAIL_MISSING",
      status: { in: ["UNREAD", "READ"] },
    },
  })

  if (exists) return

  await prisma.notification.create({
    data: {
      userId,
      type: "EMAIL_MISSING",
      title: "Add email address",
      message:
        "Add your email address to receive service and sync notifications. You can do this in your account settings.",
    },
  })
}

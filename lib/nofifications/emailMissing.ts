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
      title: "Dodaj adres e-mail",
      message:
        "Dodaj adres e-mail, aby otrzymywać powiadomienia o serwisie i synchronizacji. Możesz to zrobić w ustawieniach konta .",
    },
  })
}

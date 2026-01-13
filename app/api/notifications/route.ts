import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"


export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json([], { status: 401 })
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      status: "UNREAD",
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return Response.json(notifications)
}

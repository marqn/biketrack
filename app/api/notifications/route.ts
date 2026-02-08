import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextRequest } from "next/server"


export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json([], { status: 401 })
  }

  const fetchAll = request.nextUrl.searchParams.get("all") === "true"

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      ...(!fetchAll && { status: "UNREAD" }),
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(fetchAll && { take: 100 }),
  })

  return Response.json(notifications)
}

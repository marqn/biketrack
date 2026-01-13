import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function PATCH(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(null, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  })

  return new Response(null, { status: 204 })
}

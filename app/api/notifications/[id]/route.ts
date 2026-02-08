import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // <- Dodane await
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(null, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: {
      id: id, // <- Używaj zmiennej zamiast params.id
      userId: session.user.id,
    },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  })

  return new Response(null, { status: 204 })
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(null, { status: 401 })
  }

  await prisma.notification.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  })

  return new Response(null, { status: 204 })
}

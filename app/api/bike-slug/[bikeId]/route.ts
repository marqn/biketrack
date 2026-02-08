import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bikeId: string }> }
) {
  const { bikeId } = await params;

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { slug: true, isPublic: true },
  });

  if (!bike || !bike.isPublic || !bike.slug) {
    return Response.json({ slug: null }, { status: 404 });
  }

  return Response.json({ slug: bike.slug });
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BikePublicView } from "@/components/discover/BikePublicView";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AdminBikeDetailPage({
  params,
}: {
  params: Promise<{ bikeId: string }>;
}) {
  const { bikeId } = await params;

  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    include: {
      parts: {
        where: { isInstalled: true },
        include: {
          product: {
            select: {
              id: true,
              brand: true,
              model: true,
              type: true,
              averageRating: true,
              totalReviews: true,
            },
          },
        },
        orderBy: { type: "asc" },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          profileSlug: true,
        },
      },
      _count: {
        select: { comments: { where: { isHidden: false, parentId: null } } },
      },
    },
  });

  if (!bike) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-4">
      <Link href={`/admin/users/${bike.userId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do użytkownika
        </Button>
      </Link>
      <BikePublicView
        bike={bike}
        isOwner={false}
        isLoggedIn={true}
        currentUserId={undefined}
      />
    </div>
  );
}

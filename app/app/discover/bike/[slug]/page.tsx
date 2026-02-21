import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BikePublicView } from "@/components/discover/BikePublicView";
import { unstable_cache } from "next/cache";

const getBikePublicData = unstable_cache(
  async (slug: string) => {
    return prisma.bike.findUnique({
      where: { slug },
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
  },
  ["bike-public-detail"],
  { revalidate: 60, tags: ["bike-public-detail"] }
);

interface BikePublicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BikePublicPage({ params }: BikePublicPageProps) {
  const { slug } = await params;

  const bike = await getBikePublicData(slug);

  if (!bike || !bike.isPublic) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.id === bike.userId;
  const isLoggedIn = !!session?.user?.id;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <BikePublicView
          bike={bike}
          isOwner={isOwner}
          isLoggedIn={isLoggedIn}
          currentUserId={session?.user?.id}
        />
      </div>
    </div>
  );
}

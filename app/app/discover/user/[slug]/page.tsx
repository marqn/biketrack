import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { UserPublicProfile } from "@/components/discover/UserPublicProfile";

interface UserPublicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserPublicPage({ params }: UserPublicPageProps) {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { profileSlug: slug },
    select: {
      name: true,
      image: true,
      bio: true,
      bikes: {
        where: { isPublic: true },
        select: {
          slug: true,
          brand: true,
          model: true,
          year: true,
          type: true,
          isElectric: true,
          totalKm: true,
          images: true,
          imageUrl: true,
          _count: {
            select: { comments: { where: { isHidden: false, parentId: null } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <UserPublicProfile user={user} bikes={user.bikes} />
      </div>
    </div>
  );
}

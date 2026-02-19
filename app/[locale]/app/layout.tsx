import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BikeHeader } from "@/components/bike-header/BikeHeader";
import { Footer } from "@/components/footer/Footer";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  let headerProps = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        bikes: true,
        accounts: {
          where: { provider: "strava" },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (user?.bikes?.[0]) {
      // Odczytaj wybrany rower z cookie
      const cookieStore = await cookies();
      const selectedBikeId = cookieStore.get("selectedBikeId")?.value;

      // Znajdź wybrany rower lub użyj pierwszego
      const activeBike =
        (selectedBikeId && user.bikes.find((b) => b.id === selectedBikeId)) ||
        user.bikes[0];

      const headerBike = {
        id: activeBike.id,
        type: activeBike.type,
        stravaGearId: activeBike.stravaGearId,
        brand: activeBike.brand,
        model: activeBike.model,
        year: activeBike.year,
        description: activeBike.description,
        isElectric: activeBike.isElectric,
        totalKm: activeBike.totalKm,
        userId: activeBike.userId,
        createdAt: activeBike.createdAt,
        isPublic: activeBike.isPublic,
        slug: activeBike.slug,
        imageUrl: activeBike.imageUrl,
        images: activeBike.images,
      };

      const headerBikes = user.bikes.map((b) => ({
        id: b.id,
        name: b.type,
        type: b.type,
        stravaGearId: b.stravaGearId,
        brand: b.brand,
        model: b.model,
        year: b.year,
        description: b.description,
        isElectric: b.isElectric,
        totalKm: b.totalKm,
        userId: b.userId,
        createdAt: b.createdAt,
        isPublic: b.isPublic,
        slug: b.slug,
        imageUrl: b.imageUrl,
        images: b.images,
      }));

      // Sprawdź czy premium jest aktywny
      const isPremium = user.plan === "PREMIUM" && user.planExpiresAt && user.planExpiresAt > new Date();

      headerProps = {
        bike: headerBike,
        bikes: headerBikes,
        user: {
          id: user.id,
          name: user.name!,
          email: user.email!,
          image: user.image,
          role: user.role,
          plan: isPremium ? "PREMIUM" as const : "FREE" as const,
        },
        lastStravaSync: user.lastStravaSync?.toISOString() ?? null,
        hasStrava: user.accounts.length > 0,
      };
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {headerProps && <BikeHeader {...headerProps} />}
      <main className="flex-1 container mx-auto px-2 pt-24 pb-8">{children}</main>
      <Footer />
    </div>
  );
}

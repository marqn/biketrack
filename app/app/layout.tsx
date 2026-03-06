import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BikeHeader } from "../../components/bike-header/BikeHeader";
import { Footer } from "../../components/footer/Footer";
import { StravaSyncProvider } from "../../components/strava-sync-context";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  let headerProps = null;
  let stravaProps = { hasStrava: false, lastStravaSync: null as string | null };

  if (session?.user?.id) {
    let user = null;
    let dbSchemaError = false;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          plan: true,
          planExpiresAt: true,
          lastStravaSync: true,
          bikes: {
            select: {
              id: true,
              type: true,
              stravaGearId: true,
              brand: true,
              model: true,
              year: true,
              description: true,
              isElectric: true,
              totalKm: true,
              userId: true,
              createdAt: true,
              isPublic: true,
              slug: true,
              imageUrl: true,
              images: true,
              hiddenMaintenanceItems: true,
              maintenanceIntervals: true,
            },
          },
          accounts: {
            where: { provider: "strava" },
            select: { id: true },
            take: 1,
          },
        },
      });
    } catch {
      // Błąd schematu DB (np. brakująca kolumna po deploy przed db push)
      // Nie rzucaj i nie wylogowuj — renderuj bez danych headera,
      // strona sama złapie błąd przez swój error boundary
      dbSchemaError = true;
    }

    // Wyloguj tylko gdy DB działa poprawnie ale user nie istnieje
    if (!dbSchemaError && !user) {
      redirect("/auth/signout");
    }

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
        hiddenMaintenanceItems: activeBike.hiddenMaintenanceItems,
        maintenanceIntervals: activeBike.maintenanceIntervals,
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
        hiddenMaintenanceItems: b.hiddenMaintenanceItems,
        maintenanceIntervals: b.maintenanceIntervals,
      }));

      // Sprawdź czy premium jest aktywny
      const isPremium = user.plan === "PREMIUM" && user.planExpiresAt && user.planExpiresAt > new Date();

      stravaProps = {
        hasStrava: user.accounts.length > 0,
        lastStravaSync: user.lastStravaSync?.toISOString() ?? null,
      };

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
      };
    }
  }

  return (
    <StravaSyncProvider
      hasStrava={stravaProps.hasStrava}
      lastStravaSync={stravaProps.lastStravaSync}
    >
      <div className="flex flex-col min-h-screen">
        {headerProps && <BikeHeader {...headerProps} />}
        <main className="flex-1 container mx-auto px-2 pt-28 md:pt-24 pb-8">{children}</main>
        <Footer />
      </div>
    </StravaSyncProvider>
  );
}

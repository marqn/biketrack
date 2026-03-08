import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import Link from "next/link";
import { getTopProducts } from "./app/actions/get-top-products";
import { getLandingStats } from "./app/actions/get-landing-stats";
import { TopProductsSection } from "@/components/top-products/TopProductsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CommunityStatsSection } from "@/components/landing/CommunityStatsSection";
import { PopularBikeSection } from "@/components/landing/PopularBikeSection";
import { PopularPartSection } from "@/components/landing/PopularPartSection";
import { Footer } from "@/components/footer/Footer";
import { ThemeToggle } from "@/components/landing/ThemeToggle";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Jeśli nie zalogowany, pokaż stronę główną
  if (!session || !session.user) {
    const [topProducts, landingStats] = await Promise.all([
      getTopProducts(6),
      getLandingStats(),
    ]);

    return (
      <div className="min-h-screen bg-linear-to-b from-background to-secondary/20">
        <div className="flex justify-end px-4 pt-4">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center px-4 py-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-6xl">
                🚴
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight">MBike.cc</h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Zarządzaj serwisem swoich rowerów w jednym miejscu.
              Śledź przebieg, wymieniaj części i nigdy nie przegap konserwacji.
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg">Zaloguj się</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Utwórz konto</Button>
              </Link>
            </div>
          </div>
        </div>

        <CommunityStatsSection stats={landingStats} />
        <PopularBikeSection stats={landingStats} />
        <FeaturesSection />
        <PopularPartSection stats={landingStats} />
        <TopProductsSection products={topProducts} />
        <Footer />
      </div>
    );
  }

  // Jeśli zalogowany, sprawdź rowery
  const bikeCount = await prisma.bike.count({
    where: { userId: session.user.id },
  });

  // Jeśli ma rowery, przekieruj do app
  if (bikeCount > 0) {
    redirect("/app");
  }

  // Jeśli nie ma rowerów, przekieruj do onboardingu
  const provider = session.user.provider || "credentials";
  
  if (provider === "strava") {
    redirect("/onboarding/strava-sync");
  } else if (provider === "facebook") {
    redirect("/onboarding/facebook-sync");
  } else if (provider === "google") {
    redirect("/onboarding/google-sync");
  } else {
    redirect("/onboarding/credentials");
  }
}

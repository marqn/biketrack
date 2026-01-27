import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import { getTopProducts } from "./app/actions/get-top-products";
import { TopProductsSection } from "@/components/top-products/TopProductsSection";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Jeśli nie zalogowany, pokaż stronę główną
  if (!session || !session.user) {
    const topProducts = await getTopProducts(5);

    return (
      <div className="min-h-screen bg-linear-to-b from-background to-secondary/20">
        <div className="flex items-center justify-center px-4 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-6xl">
                🚴
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight">BikeTrack</h1>

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

        <TopProductsSection products={topProducts} />
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

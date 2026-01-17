import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  } else {
    console.log("Session data:", session);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { bikes: true },
  });

  const bikeCount = await prisma.bike.count({
    where: { user: { id: session.user.id } },
  });

  if (bikeCount > 0) {
    redirect("/app");
  }

  if (user?.bikes.length === 0 || user?.bikes.length === 1) {
    if (session.user.provider === "strava") {
      redirect("/onboarding/strava-sync");
    }

    if (session.user.provider === "google") {
      redirect("/onboarding/google-sync");
    }
    if (session.user.provider === "credentials") {
      redirect("/onboarding/credentials");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center px-4">
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
  );
}

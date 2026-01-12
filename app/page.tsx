import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "./api/auth/[...nextauth]/route";

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
  }
}

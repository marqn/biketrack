// app/onboarding/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Sprawdź czy użytkownik ma już rowery
  const bikesCount = await prisma.bike.count({
    where: { userId: session.user.id },
  });

  if (bikesCount > 0) {
    redirect("/app");
  }

  // Przekieruj na podstawie providera
  const provider = session.user.provider;

  if (provider === "strava") {
    redirect("/onboarding/strava");
  } else if (provider === "google") {
    redirect("/onboarding/google");
  } else {
    redirect("/onboarding/credentials");
  }
}
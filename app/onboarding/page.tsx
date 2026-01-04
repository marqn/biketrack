// app/onboarding/page.tsx (BEZ "use client")
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../api/auth/[...nextauth]/route";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const bikeCount = await prisma.bike.count({
    where: { user: { id: session.user.id } },
  });

  if (bikeCount > 0) {
    redirect("/app");
  }

  return <OnboardingClient />;
}
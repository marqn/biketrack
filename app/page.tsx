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

  if (!user?.bikes || user.bikes.length === 1) {
    redirect("/onboarding");
  }
}

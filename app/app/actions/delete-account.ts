"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function deleteAccount() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  await prisma.user.delete({
    where: { email: session.user.email },
  });

  redirect("/login");
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const PLAN_DURATIONS: Record<string, number> = {
  "1month": 1,
  "5months": 6,
  "12months": 12,
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    const months = PLAN_DURATIONS[planId];
    if (!months) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Oblicz datę wygaśnięcia od teraz
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + months);

    // Jeśli user już ma aktywny premium, przedłuż od daty wygaśnięcia
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, planExpiresAt: true },
    });

    if (user?.plan === "PREMIUM" && user.planExpiresAt && user.planExpiresAt > now) {
      expiresAt.setTime(user.planExpiresAt.getTime());
      expiresAt.setMonth(expiresAt.getMonth() + months);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plan: "PREMIUM",
        planExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      plan: "PREMIUM",
      planExpiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

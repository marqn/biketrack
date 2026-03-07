import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // Sprawdź czy użytkownik jest zalogowany
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pobierz bikeId z query params (opcjonalnie)
    const { searchParams } = new URL(request.url);
    const bikeId = searchParams.get("bikeId");

    let bike;
    let replacements;
    let services;
    let customReplacements: Array<{
      id: string; name: string; category: string; brand: string | null;
      model: string | null; wearKm: number; expectedKm: number;
      removedAt: Date | null; createdAt: Date;
    }> = [];

    if (bikeId) {
      // Pobierz konkretny rower
      bike = await prisma.bike.findFirst({
        where: {
          id: bikeId,
          userId: session.user.id,
        },
        select: {
          id: true,
          brand: true,
          model: true,
          type: true,
          totalKm: true,
        },
      });

      if (!bike) {
        return NextResponse.json({ error: "Bike not found" }, { status: 404 });
      }

      // Pobierz wymiany dla tego roweru
      replacements = await prisma.partReplacement.findMany({
        where: {
          bikeId: bikeId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          partType: true,
          brand: true,
          model: true,
          notes: true,
          kmAtReplacement: true,
          kmUsed: true,
          createdAt: true,
          product: {
            select: {
              images: true,
            },
          },
        },
      });

      // Pobierz serwisy (smarowania)
      services = await prisma.serviceEvent.findMany({
        where: {
          bikeId: bikeId,
          type: "CHAIN_LUBE",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          type: true,
          kmAtTime: true,
          lubricantBrand: true,
          notes: true,
          createdAt: true,
        },
      });

      // Pobierz wymiany customowych części
      customReplacements = await prisma.customStoredPart.findMany({
        where: { fromBikeId: bikeId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          category: true,
          brand: true,
          model: true,
          wearKm: true,
          expectedKm: true,
          removedAt: true,
          createdAt: true,
        },
      });
    } else {
      // Pobierz pierwszy rower użytkownika (domyślny)
      bike = await prisma.bike.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          brand: true,
          model: true,
          type: true,
          totalKm: true,
        },
      });

      if (!bike) {
        return NextResponse.json(
          {
            bike: null,
            replacements: [],
            services: [],
            message: "No bikes found",
          },
          { status: 200 },
        );
      }

      // Pobierz wymiany dla pierwszego roweru
      replacements = await prisma.partReplacement.findMany({
        where: {
          bikeId: bike.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          partType: true,
          brand: true,
          model: true,
          notes: true,
          kmAtReplacement: true,
          kmUsed: true,
          createdAt: true,
          product: {
            select: {
              images: true,
            },
          },
        },
      });

      // Pobierz serwisy (smarowania)
      services = await prisma.serviceEvent.findMany({
        where: {
          bikeId: bike.id,
          type: "CHAIN_LUBE",
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          lubricantProduct: true,
        },
      });

      // Pobierz wymiany customowych części
      customReplacements = await prisma.customStoredPart.findMany({
        where: { fromBikeId: bike.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          category: true,
          brand: true,
          model: true,
          wearKm: true,
          expectedKm: true,
          removedAt: true,
          createdAt: true,
        },
      });
    }

    // Połącz wymiany, serwisy i wymiany customowych części w jeden timeline
    const timeline = [
      ...replacements.map((r) => ({
        id: r.id,
        type: "replacement" as const,
        data: r,
        createdAt: r.createdAt,
      })),
      ...services.map((s) => ({
        id: s.id,
        type: "service" as const,
        data: s,
        createdAt: s.createdAt,
      })),
      ...customReplacements.map((c) => ({
        id: c.id,
        type: "custom-replacement" as const,
        data: c,
        createdAt: c.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      bike,
      timeline,
      replacements, // Dla kompatybilności wstecznej
      services,
    });
  } catch (error) {
    console.error("Error fetching part replacements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

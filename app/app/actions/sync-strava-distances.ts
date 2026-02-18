"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getStravaAccessToken, getStravaBikeDistances } from "@/lib/strava";
import { checkBikeNotifications } from "@/lib/nofifications/checkBikeNotifications";
import { revalidatePath } from "next/cache";

const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 godzina

export type StravaSyncUpdate = {
  bikeName: string;
  oldKm: number;
  newKm: number;
  diffKm: number;
};

export async function syncStravaDistances(force = false): Promise<{
  synced: number;
  skipped: boolean;
  updates: StravaSyncUpdate[];
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { synced: 0, skipped: false, updates: [] };
  }

  // Sprawdź cooldown (pomiń przy force)
  if (!force) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastStravaSync: true },
    });

    if (user?.lastStravaSync) {
      const elapsed = Date.now() - user.lastStravaSync.getTime();
      if (elapsed < SYNC_COOLDOWN_MS) {
        return { synced: 0, skipped: true, updates: [] };
      }
    }
  }

  // Pobierz token Strava (z automatycznym refreshem)
  const accessToken = await getStravaAccessToken(session.user.id);
  if (!accessToken) {
    return { synced: 0, skipped: false };
  }

  try {
    // 1 wywołanie API Strava
    const stravaBikes = await getStravaBikeDistances(accessToken);

    if (stravaBikes.length === 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { lastStravaSync: new Date() },
      });
      return { synced: 0, skipped: false, updates: [] };
    }

    // Mapa: stravaGearId -> dystans w km
    const stravaDistanceMap = new Map<string, number>();
    for (const bike of stravaBikes) {
      stravaDistanceMap.set(bike.id, Math.round(bike.distance / 1000));
    }

    // Pobierz rowery usera z stravaGearId
    const userBikes = await prisma.bike.findMany({
      where: {
        userId: session.user.id,
        stravaGearId: { not: null },
      },
      select: {
        id: true,
        stravaGearId: true,
        totalKm: true,
        brand: true,
        model: true,
        type: true,
      },
    });

    let syncedCount = 0;
    const updates: StravaSyncUpdate[] = [];

    for (const bike of userBikes) {
      const stravaKm = stravaDistanceMap.get(bike.stravaGearId!);
      if (stravaKm === undefined) continue;

      const diffKm = stravaKm - bike.totalKm;
      if (diffKm <= 0) continue;

      // Ta sama logika co updateBikeKm: bike.totalKm + parts.wearKm
      await prisma.$transaction([
        prisma.bike.update({
          where: { id: bike.id },
          data: { totalKm: stravaKm },
        }),
        prisma.bikePart.updateMany({
          where: { bikeId: bike.id, isInstalled: true },
          data: {
            wearKm: { increment: diffKm },
          },
        }),
        prisma.customPart.updateMany({
          where: { bikeId: bike.id },
          data: {
            wearKm: { increment: diffKm },
          },
        }),
      ]);

      const bikeName = (bike.brand || bike.model)
        ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
        : bike.type;

      updates.push({
        bikeName,
        oldKm: bike.totalKm,
        newKm: stravaKm,
        diffKm,
      });

      await checkBikeNotifications(bike.id);
      syncedCount++;
    }

    // Aktualizuj timestamp ostatniego sync
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastStravaSync: new Date() },
    });

    if (syncedCount > 0) {
      revalidatePath("/app");
    }

    return { synced: syncedCount, skipped: false, updates };
  } catch (error) {
    console.error("Strava sync error:", error);
    return { synced: 0, skipped: false, updates: [] };
  }
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { refreshStravaToken, getStravaBikeDistances } from "@/lib/strava";
import {
  collectBikeNotifications,
  notifKey,
  type BikeWithSyncData,
} from "@/lib/nofifications/checkBikeNotifications";
import { revalidatePath } from "next/cache";
import { NotificationStatus, ServiceType } from "@/lib/generated/prisma";

const SYNC_COOLDOWN_MS = 15 * 60 * 1000; // 15 minut

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

  const userId = session.user.id;

  // QUERY 1: user + konto Strava w jednym zapytaniu
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastStravaSync: true,
      accounts: {
        where: { provider: "strava" },
        select: {
          id: true,
          access_token: true,
          refresh_token: true,
          expires_at: true,
        },
      },
    },
  });

  // Sprawdź cooldown (pomiń przy force)
  if (!force && user?.lastStravaSync) {
    const elapsed = Date.now() - user.lastStravaSync.getTime();
    if (elapsed < SYNC_COOLDOWN_MS) {
      return { synced: 0, skipped: true, updates: [] };
    }
  }

  const account = user?.accounts[0];
  if (!account?.access_token) {
    return { synced: 0, skipped: false, updates: [] };
  }

  // Odśwież token jeśli wygasł (+1 zapytanie DB, tylko gdy potrzebne)
  let accessToken = account.access_token;
  if (account.expires_at && account.expires_at * 1000 < Date.now() + 5 * 60 * 1000) {
    const refreshed = await refreshStravaToken(account);
    if (!refreshed) return { synced: 0, skipped: false, updates: [] };
    accessToken = refreshed;
  }

  try {
    // Wywołanie API Strava (kosztowne — chronione przez cooldown 15 min)
    const stravaBikes = await getStravaBikeDistances(accessToken);

    if (stravaBikes.length === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastStravaSync: new Date() },
      });
      return { synced: 0, skipped: false, updates: [] };
    }

    const stravaMap = new Map(
      stravaBikes.map(b => [b.id, Math.round(b.distance / 1000)])
    );

    // QUERY 2: rowery + wszystkie dane potrzebne do powiadomień w jednym zapytaniu
    const userBikes = await prisma.bike.findMany({
      where: { userId, stravaGearId: { not: null } },
      select: {
        id: true,
        stravaGearId: true,
        totalKm: true,
        brand: true,
        model: true,
        type: true,
        userId: true,
        hiddenMaintenanceItems: true,
        parts: {
          select: {
            id: true,
            type: true,
            wearKm: true,
            expectedKm: true,
            isInstalled: true,
            installedAt: true,
            createdAt: true,
            bikeId: true,
          },
        },
        services: {
          where: {
            type: {
              in: [
                ServiceType.CHAIN_LUBE,
                ServiceType.SEALANT_FRONT,
                ServiceType.SEALANT_REAR,
              ],
            },
          },
          orderBy: { createdAt: "desc" },
          select: { type: true, createdAt: true, kmAtTime: true },
        },
        maintenanceLogs: {
          orderBy: { createdAt: "desc" },
          select: { type: true, createdAt: true, kmAtTime: true },
        },
      },
    });

    // Wyznacz rowery do aktualizacji
    const bikesToUpdate = userBikes.filter(bike => {
      const stravaKm = stravaMap.get(bike.stravaGearId!);
      return stravaKm !== undefined && stravaKm - bike.totalKm > 0;
    });

    if (bikesToUpdate.length === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastStravaSync: new Date() },
      });
      return { synced: 0, skipped: false, updates: [] };
    }

    const updatedBikeIds = bikesToUpdate.map(b => b.id);

    // QUERY 3: istniejące UNREAD powiadomienia dla zaktualizowanych rowerów
    const existingNotifications = await prisma.notification.findMany({
      where: {
        userId,
        bikeId: { in: updatedBikeIds },
        status: NotificationStatus.UNREAD,
      },
      select: { type: true, bikeId: true, partId: true },
    });

    const existingSet = new Set(
      existingNotifications.map(n => notifKey(n.type, n.bikeId, n.partId))
    );

    // Zbuduj operacje transakcji + zbierz powiadomienia
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbOps: any[] = [];
    const updates: StravaSyncUpdate[] = [];
    const allNewNotifs: Parameters<typeof prisma.notification.createMany>[0]["data"] = [];

    for (const bike of bikesToUpdate) {
      const stravaKm = stravaMap.get(bike.stravaGearId!)!;
      const diffKm = stravaKm - bike.totalKm;

      dbOps.push(
        prisma.bike.update({
          where: { id: bike.id },
          data: { totalKm: stravaKm },
        }),
        prisma.bikePart.updateMany({
          where: { bikeId: bike.id, isInstalled: true },
          data: { wearKm: { increment: diffKm } },
        }),
        prisma.customPart.updateMany({
          where: { bikeId: bike.id },
          data: { wearKm: { increment: diffKm } },
        }),
      );

      const bikeName = (bike.brand || bike.model)
        ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
        : bike.type;

      updates.push({ bikeName, oldKm: bike.totalKm, newKm: stravaKm, diffKm });

      // Koryguj wearKm w pamięci (transakcja jeszcze nie wykonana)
      const adjustedBike: BikeWithSyncData = {
        ...bike,
        totalKm: stravaKm,
        parts: bike.parts.map(p => ({
          ...p,
          wearKm: p.isInstalled ? p.wearKm + diffKm : p.wearKm,
        })),
      };

      const newNotifs = collectBikeNotifications(adjustedBike, existingSet);
      allNewNotifs.push(...newNotifs);
    }

    // QUERY 4: transakcja — aktualizacja km
    await prisma.$transaction(dbOps);

    // QUERY 5: batch insert powiadomień (tylko jeśli są nowe)
    if (allNewNotifs.length > 0) {
      await prisma.notification.createMany({
        data: allNewNotifs,
        skipDuplicates: true,
      });
    }

    // QUERY 6: aktualizacja timestampu sync
    await prisma.user.update({
      where: { id: userId },
      data: { lastStravaSync: new Date() },
    });

    revalidatePath("/app");

    return { synced: bikesToUpdate.length, skipped: false, updates };
  } catch (error) {
    console.error("Strava sync error:", error);
    return { synced: 0, skipped: false, updates: [] };
  }
}

// lib/strava.ts
import { prisma } from "@/lib/prisma";
import { checkBikeNotifications } from "@/lib/nofifications/checkBikeNotifications";

export type StravaSyncUpdate = {
  bikeName: string;
  oldKm: number;
  newKm: number;
  diffKm: number;
};

const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 godzina
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minut

export async function getStravaAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "strava",
    },
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
    },
  });

  if (!account?.access_token) {
    return null;
  }

  // Sprawdź czy token wygasł (z 5-minutowym buforem)
  if (account.expires_at && account.expires_at * 1000 < Date.now() + 5 * 60 * 1000) {
    if (!account.refresh_token) {
      console.error("Strava token expired and no refresh_token available");
      return null;
    }

    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: account.refresh_token,
        }),
      });

      if (!response.ok) {
        console.error("Failed to refresh Strava token:", response.status);
        return null;
      }

      const data = await response.json();

      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
        },
      });

      return data.access_token;
    } catch (error) {
      console.error("Error refreshing Strava token:", error);
      return null;
    }
  }

  return account.access_token;
}

export async function getAthleteGear(accessToken: string) {
  const athleteResponse = await fetch(
    "https://www.strava.com/api/v3/athlete",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!athleteResponse.ok) {
    throw new Error("Failed to fetch athlete data");
  }

  const athlete = await athleteResponse.json();

  if (!athlete.bikes || athlete.bikes.length === 0) {
    return [];
  }

  const bikes = await Promise.all(
    athlete.bikes.map(async (bike: any) => {
      const gearResponse = await fetch(
        `https://www.strava.com/api/v3/gear/${bike.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return gearResponse.json();
    })
  );

  return bikes;
}

/**
 * Lekka wersja - pobiera tylko id i dystans rowerów z jednego API call.
 * Używana do sync dystansów (nie potrzebujemy pełnych danych gear).
 */
export async function getStravaBikeDistances(
  accessToken: string
): Promise<Array<{ id: string; distance: number }>> {
  const response = await fetch("https://www.strava.com/api/v3/athlete", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Strava API error: ${response.status}`);
  }

  const athlete = await response.json();

  if (!athlete.bikes || athlete.bikes.length === 0) {
    return [];
  }

  return athlete.bikes.map((bike: any) => ({
    id: bike.id as string,
    distance: bike.distance as number, // w metrach
  }));
}

// ========== Cache ==========

export async function getStravaCache(
  userId: string
): Promise<Array<{ id: string; distance: number }> | null> {
  const cache = await prisma.stravaCache.findUnique({ where: { userId } });
  if (!cache) return null;

  const age = Date.now() - cache.cachedAt.getTime();
  if (age > CACHE_TTL_MS) return null; // wygasł

  return cache.data as Array<{ id: string; distance: number }>;
}

export async function setStravaCache(
  userId: string,
  bikes: Array<{ id: string; distance: number }>
): Promise<void> {
  await prisma.stravaCache.upsert({
    where: { userId },
    create: { userId, data: bikes, cachedAt: new Date() },
    update: { data: bikes, cachedAt: new Date() },
  });
}

export async function invalidateStravaCache(userId: string): Promise<void> {
  await prisma.stravaCache.deleteMany({ where: { userId } });
}

/**
 * Wersja z cache — sprawdza lokalny cache (10 min TTL) przed wywołaniem API.
 * force=true pomija cache i zawsze pobiera świeże dane.
 */
export async function getStravaBikeDistancesWithCache(
  userId: string,
  accessToken: string,
  force = false
): Promise<Array<{ id: string; distance: number }>> {
  if (!force) {
    const cached = await getStravaCache(userId);
    if (cached) return cached;
  }

  const bikes = await getStravaBikeDistances(accessToken);
  await setStravaCache(userId, bikes);
  return bikes;
}

// ========== Sync bez sesji (używane przez webhook) ==========

/**
 * Synchronizuje dystanse Strava dla danego userId.
 * Nie wymaga sesji — może być wywołane przez webhook.
 * force=true: pomija cooldown 1h i cache.
 */
export async function syncStravaDistancesForUser(
  userId: string,
  force = false
): Promise<{ synced: number; updates: StravaSyncUpdate[] }> {
  if (!force) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastStravaSync: true },
    });
    if (user?.lastStravaSync) {
      const elapsed = Date.now() - user.lastStravaSync.getTime();
      if (elapsed < SYNC_COOLDOWN_MS) return { synced: 0, updates: [] };
    }
  }

  const accessToken = await getStravaAccessToken(userId);
  if (!accessToken) return { synced: 0, updates: [] };

  try {
    const stravaBikes = await getStravaBikeDistancesWithCache(userId, accessToken, force);

    if (stravaBikes.length === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastStravaSync: new Date() },
      });
      return { synced: 0, updates: [] };
    }

    const stravaDistanceMap = new Map<string, number>();
    for (const bike of stravaBikes) {
      stravaDistanceMap.set(bike.id, Math.round(bike.distance / 1000));
    }

    const userBikes = await prisma.bike.findMany({
      where: { userId, stravaGearId: { not: null } },
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

      await prisma.$transaction([
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
      ]);

      const bikeName = bike.brand || bike.model
        ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
        : bike.type;

      updates.push({ bikeName, oldKm: bike.totalKm, newKm: stravaKm, diffKm });
      await checkBikeNotifications(bike.id);
      syncedCount++;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { lastStravaSync: new Date() },
    });

    return { synced: syncedCount, updates };
  } catch (error) {
    console.error("Strava sync error (userId:", userId, "):", error);
    return { synced: 0, updates: [] };
  }
}

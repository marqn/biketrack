"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { syncStravaDistancesForUser } from "@/lib/strava";
import { revalidatePath } from "next/cache";

export type { StravaSyncUpdate } from "@/lib/strava";

const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 godzina

export async function syncStravaDistances(force = false): Promise<{
  synced: number;
  skipped: boolean;
  updates: import("@/lib/strava").StravaSyncUpdate[];
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { synced: 0, skipped: false, updates: [] };
  }

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

  const result = await syncStravaDistancesForUser(session.user.id, force);

  if (result.synced > 0) {
    revalidatePath("/app");
  }

  return { ...result, skipped: false };
}

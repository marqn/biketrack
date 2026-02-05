"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getStravaAccessToken, getAthleteGear } from "@/lib/strava";

export interface StravaBikeForImport {
  id: string;
  name: string;
  distance: number;
  brand_name: string | null;
  model_name: string | null;
  primary: boolean;
}

interface GetStravaBikesResult {
  success: boolean;
  bikes: StravaBikeForImport[];
  hasStravaAccount: boolean;
  isPremium: boolean;
  error?: string;
}

export async function getAvailableStravaBikes(): Promise<GetStravaBikesResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      success: false,
      bikes: [],
      hasStravaAccount: false,
      isPremium: false,
      error: "Nie jesteś zalogowany",
    };
  }

  // Sprawdź czy user jest premium
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      planExpiresAt: true,
      bikes: {
        select: { stravaGearId: true },
      },
    },
  });

  if (!user) {
    return {
      success: false,
      bikes: [],
      hasStravaAccount: false,
      isPremium: false,
      error: "Użytkownik nie znaleziony",
    };
  }

  const isPremium = Boolean(
    user.plan === "PREMIUM" &&
    user.planExpiresAt &&
    user.planExpiresAt > new Date()
  );

  // Sprawdź czy ma konto Strava
  const stravaAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "strava",
    },
    select: { id: true },
  });

  if (!stravaAccount) {
    return {
      success: true,
      bikes: [],
      hasStravaAccount: false,
      isPremium,
    };
  }

  // Jeśli nie jest premium, nie pobieraj rowerów ze Stravy
  if (!isPremium) {
    return {
      success: true,
      bikes: [],
      hasStravaAccount: true,
      isPremium: false,
    };
  }

  // Pobierz access token
  const accessToken = await getStravaAccessToken(session.user.id);
  if (!accessToken) {
    return {
      success: true,
      bikes: [],
      hasStravaAccount: true,
      isPremium,
      error: "Nie udało się pobrać tokenu Strava",
    };
  }

  try {
    // Pobierz rowery ze Stravy
    const stravaBikes = await getAthleteGear(accessToken);

    // Pobierz listę już dodanych stravaGearId
    const addedStravaIds = new Set(
      user.bikes
        .map((b) => b.stravaGearId)
        .filter((id): id is string => id !== null)
    );

    // Filtruj rowery - usuń już dodane
    const availableBikes: StravaBikeForImport[] = stravaBikes
      .filter((bike: any) => !addedStravaIds.has(bike.id))
      .map((bike: any) => ({
        id: bike.id,
        name: bike.name,
        distance: bike.distance || 0,
        brand_name: bike.brand_name || null,
        model_name: bike.model_name || null,
        primary: bike.primary ?? false,
      }));

    return {
      success: true,
      bikes: availableBikes,
      hasStravaAccount: true,
      isPremium,
    };
  } catch (error) {
    console.error("Błąd pobierania rowerów ze Strava:", error);
    return {
      success: true,
      bikes: [],
      hasStravaAccount: true,
      isPremium,
      error: "Nie udało się pobrać rowerów ze Strava",
    };
  }
}

// lib/strava.ts
import { prisma } from "@/lib/prisma";

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

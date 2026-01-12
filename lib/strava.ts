// lib/strava.ts
import { prisma } from "@/lib/prisma";

export async function getStravaAccessToken(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "strava",
    },
    select: {
      access_token: true,
      refresh_token: true,
      expires_at: true,
    },
  });

  if (!account?.access_token) {
    return null;
  }

  // TODO: Sprawdź czy token wygasł i odśwież go jeśli potrzeba
  // if (account.expires_at && account.expires_at * 1000 < Date.now()) {
  //   return await refreshStravaToken(account.refresh_token);
  // }

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
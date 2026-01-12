// app/onboarding/sync-strava-bikes.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAthleteGear, getStravaAccessToken } from "@/lib/strava";

export async function syncStravaBikes() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Nie jesteś zalogowany");
  }

  // Pobierz token Strava z bazy danych
  const accessToken = await getStravaAccessToken(session.user.id);

  if (!accessToken) {
    throw new Error("Brak połączenia ze Strava. Zaloguj się przez Strava.");
  }

  try {
    const bikes = await getAthleteGear(accessToken);

    console.log("Pobrane rowery ze Strava:", bikes);

    // TODO: Zapisz do bazy danych
    // for (const bike of bikes) {
    //   await prisma.bike.upsert({
    //     where: { stravaId: bike.id },
    //     update: {
    //       name: bike.name,
    //       totalKm: Math.round(bike.distance / 1000),
    //     },
    //     create: {
    //       stravaId: bike.id,
    //       name: bike.name,
    //       totalKm: Math.round(bike.distance / 1000),
    //       userId: session.user.id,
    //     },
    //   });
    // }

    return bikes;
  } catch (error) {
    console.error("Błąd synchronizacji:", error);
    throw new Error("Nie udało się pobrać danych ze Strava");
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateStravaCache, syncStravaDistancesForUser } from "@/lib/strava";

/**
 * GET — weryfikacja subskrypcji Strava (challenge handshake).
 * Strava wysyła ten request podczas rejestracji webhooka.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode !== "subscribe" ||
    token !== process.env.STRAVA_WEBHOOK_VERIFY_TOKEN ||
    !challenge
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Strava wymaga dokładnie tego formatu odpowiedzi
  return NextResponse.json({ "hub.challenge": challenge });
}

/**
 * POST — odbiór eventów Strava (nowa aktywność, aktualizacja itp.).
 * Strava wymaga odpowiedzi 200 w ciągu 2 sekund — sync odbywa się asynchronicznie.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  // Zawsze odpowiadamy 200 natychmiast
  if (!body) {
    return NextResponse.json({ received: true });
  }

  const { object_type, aspect_type, owner_id } = body as {
    object_type: string;
    aspect_type: string;
    owner_id: number;
  };

  // Interesuje nas tylko tworzenie nowej aktywności
  if (object_type === "activity" && aspect_type === "create" && owner_id) {
    // Fire & forget — nie blokujemy odpowiedzi
    triggerSyncForStravaAthlete(String(owner_id)).catch((err) =>
      console.error("[Strava webhook] Sync error:", err)
    );
  }

  return NextResponse.json({ received: true });
}

async function triggerSyncForStravaAthlete(stravaAthleteId: string) {
  const account = await prisma.account.findFirst({
    where: { provider: "strava", providerAccountId: stravaAthleteId },
    select: { userId: true },
  });

  if (!account) {
    console.log("[Strava webhook] Athlete not found in DB:", stravaAthleteId);
    return;
  }

  // Unieważnij cache żeby pobrać świeże dane
  await invalidateStravaCache(account.userId);

  // force=true: pomiń cooldown 1h (aktywność właśnie się pojawiła)
  const result = await syncStravaDistancesForUser(account.userId, true);
  console.log(
    `[Strava webhook] Synced userId=${account.userId}: ${result.synced} bikes updated`
  );
}

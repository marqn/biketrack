/**
 * Jednorazowy skrypt rejestracji webhooka Strava.
 *
 * Wymagania przed uruchomieniem:
 *   1. Ustaw STRAVA_WEBHOOK_VERIFY_TOKEN w .env (dowolny losowy string)
 *   2. NEXTAUTH_URL musi być publicznym URL (nie localhost!)
 *      - lokalnie: użyj ngrok i ustaw NEXTAUTH_URL=https://<id>.ngrok.io
 *      - produkcja: NEXTAUTH_URL jest już ustawiony poprawnie
 *
 * Uruchomienie:
 *   npx tsx scripts/register-strava-webhook.ts
 *
 * Po sukcesie: zapisz zwrócone STRAVA_WEBHOOK_SUBSCRIPTION_ID do .env
 */

import "dotenv/config";

const REQUIRED_VARS = [
  "STRAVA_CLIENT_ID",
  "STRAVA_CLIENT_SECRET",
  "STRAVA_WEBHOOK_VERIFY_TOKEN",
  "NEXTAUTH_URL",
] as const;

async function main() {
  // Walidacja zmiennych środowiskowych
  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      console.error(`Błąd: brakuje zmiennej środowiskowej ${key}`);
      process.exit(1);
    }
  }

  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/strava/webhook`;
  console.log("Rejestruję webhook Strava...");
  console.log("Callback URL:", callbackUrl);
  console.log("");

  const response = await fetch(
    "https://www.strava.com/api/v3/push_subscriptions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        callback_url: callbackUrl,
        verify_token: process.env.STRAVA_WEBHOOK_VERIFY_TOKEN,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Błąd rejestracji:", JSON.stringify(data, null, 2));
    console.error("");
    console.error("Najczęstsze przyczyny:");
    console.error("  - callback_url nie jest dostępny publicznie (localhost nie działa)");
    console.error("  - subskrypcja już istnieje (sprawdź GET /api/v3/push_subscriptions)");
    process.exit(1);
  }

  console.log("Webhook zarejestrowany pomyślnie!");
  console.log("Subscription ID:", data.id);
  console.log("");
  console.log("Dodaj do .env (i zmiennych środowiskowych produkcji):");
  console.log(`STRAVA_WEBHOOK_SUBSCRIPTION_ID=${data.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

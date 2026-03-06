"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertTriangle, X } from "lucide-react";
import { useStravaSync } from "@/components/strava-sync-context";
import { useSession } from "next-auth/react";
import { formatDistance } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";

const StravaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-orange-500">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
  </svg>
);

export function StravaStatusBanner() {
  const { hasStrava, status, error, lastSyncTime, updates } = useStravaSync();
  const { data: session } = useSession();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";
  const [dismissed, setDismissed] = useState(false);

  if (!hasStrava || dismissed || status === "idle") return null;

  if (status === "syncing") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-400">
        <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
        <StravaIcon />
        <span className="flex-1">Synchronizacja Strava w toku...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <StravaIcon />
        <span className="flex-1">
          <span className="font-medium">Błąd synchronizacji Strava</span>
          {error && <span className="ml-1 opacity-80">– {error}</span>}
        </span>
        <button onClick={() => setDismissed(true)} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // success z aktualizacjami
  if (updates && updates.length > 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <StravaIcon />
          <span className="flex-1 font-medium">
            Strava zsynchronizowana – zaktualizowano {updates.length}{" "}
            {updates.length === 1 ? "rower" : updates.length < 5 ? "rowery" : "rowerów"}
          </span>
          <button onClick={() => setDismissed(true)} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-1.5 ml-8 space-y-0.5">
          {updates.map((u) => (
            <li key={u.bikeName} className="text-xs opacity-80">
              {u.bikeName}: +{formatDistance(u.diffKm, unitPref)} (
              {formatDistance(u.oldKm, unitPref)} → {formatDistance(u.newKm, unitPref)})
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // success, brak zmian
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
      <StravaIcon />
      <span className="flex-1">
        Strava zsynchronizowana
        {lastSyncTime && (
          <span className="ml-1 opacity-70">
            · {new Date(lastSyncTime).toLocaleString("pl-PL")}
          </span>
        )}
      </span>
      <button onClick={() => setDismissed(true)} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

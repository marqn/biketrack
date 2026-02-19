"use client";

import { useEffect, useRef } from "react";
import { syncStravaDistances } from "@/app/actions/sync-strava-distances";

export function StravaSyncTrigger() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    syncStravaDistances()
      .then((result) => {
        if (result.synced > 0) {
          console.log(`Strava sync: zaktualizowano ${result.synced} rower(ów)`);
        }
      })
      .catch((err) => {
        console.error("Strava sync error:", err);
      });
  }, []);

  return null;
}

"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { syncStravaDistances } from "@/app/app/actions/sync-strava-distances";
import type { StravaSyncUpdate } from "@/app/app/actions/sync-strava-distances";

export type StravaSyncStatus = "idle" | "syncing" | "success" | "error";

interface StravaSyncState {
  status: StravaSyncStatus;
  error?: string;
  lastSyncTime?: string;
  updates?: StravaSyncUpdate[];
}

interface StravaSyncContextValue extends StravaSyncState {
  hasStrava: boolean;
}

const StravaSyncContext = createContext<StravaSyncContextValue>({
  hasStrava: false,
  status: "idle",
});

export function useStravaSync() {
  return useContext(StravaSyncContext);
}

interface Props {
  hasStrava: boolean;
  lastStravaSync?: string | null;
  children: React.ReactNode;
}

export function StravaSyncProvider({ hasStrava, lastStravaSync, children }: Props) {
  const router = useRouter();
  const hasFired = useRef(false);
  const [state, setState] = useState<StravaSyncState>({
    status: "idle",
    lastSyncTime: lastStravaSync ?? undefined,
  });

  const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 godzina

  useEffect(() => {
    if (!hasStrava || hasFired.current) return;
    hasFired.current = true;

    // Jeśli ostatnia sync była mniej niż godzinę temu – tylko pokaż info, nie synchronizuj
    if (lastStravaSync) {
      const elapsed = Date.now() - new Date(lastStravaSync).getTime();
      if (elapsed < SYNC_INTERVAL_MS) {
        setState({ status: "success", lastSyncTime: lastStravaSync, updates: [] });
        return;
      }
    }

    setState((s) => ({ ...s, status: "syncing" }));

    syncStravaDistances(false)
      .then((result) => {
        if (result.synced > 0) {
          router.refresh();
        }
        setState({
          status: "success",
          lastSyncTime: new Date().toISOString(),
          updates: result.updates,
        });
      })
      .catch((err: unknown) => {
        setState((s) => ({
          ...s,
          status: "error",
          error: err instanceof Error ? err.message : "Błąd synchronizacji",
        }));
      });
  }, [hasStrava, lastStravaSync, router]);

  return (
    <StravaSyncContext.Provider value={{ hasStrava, ...state }}>
      {children}
    </StravaSyncContext.Provider>
  );
}

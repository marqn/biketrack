"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  function handleReset() {
    router.refresh();
    reset();
  }

  function handleSignOut() {
    document.cookie = "selectedBikeId=; path=/; max-age=0";
    signOut({ callbackUrl: "/login" });
  }

  const isSchemaMismatch = error?.message === "DB_SCHEMA_MISMATCH";

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold">Coś poszło nie tak</h1>
        <p className="text-sm text-muted-foreground">
          {isSchemaMismatch
            ? "Trwa aktualizacja bazy danych. Odśwież stronę za chwilę."
            : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub zaloguj się ponownie."}
        </p>
        {error?.digest && (
          <p className="text-xs text-muted-foreground/60">
            Kod błędu: {error.digest}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            Spróbuj ponownie
          </Button>
          {!isSchemaMismatch && (
            <Button onClick={handleSignOut} size="sm">
              Zaloguj się ponownie
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

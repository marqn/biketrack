"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

  const isDbError =
    error?.message?.includes("does not exist") ||
    error?.message?.includes("PrismaClient") ||
    error?.message?.includes("P2");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold">Coś poszło nie tak</h1>
        <p className="text-sm text-muted-foreground">
          {isDbError
            ? "Wystąpił problem z połączeniem z bazą danych. Spróbuj odświeżyć stronę — jeśli problem się powtarza, skontaktuj się z administratorem."
            : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."}
        </p>
        {error?.digest && (
          <p className="text-xs text-muted-foreground/60">
            Kod błędu: {error.digest}
          </p>
        )}
        <Button onClick={handleReset} variant="outline" size="sm">
          Spróbuj ponownie
        </Button>
      </div>
    </div>
  );
}

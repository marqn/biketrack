"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const error = searchParams.get("error");
  const email = searchParams.get("email") ?? "";

  const [resendState, setResendState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async () => {
    setResendState("loading");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendState("sent");
        setResendMessage(data.message ?? "Wysłano nowy link weryfikacyjny.");
      } else {
        setResendState("error");
        setResendMessage(data.error ?? "Wystąpił błąd. Spróbuj ponownie.");
      }
    } catch {
      setResendState("error");
      setResendMessage("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  if (status === "verified") {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Adres e-mail potwierdzony!</CardTitle>
          <CardDescription>Twoje konto jest aktywne.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Możesz się teraz zalogować i korzystać z MBike.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Przejdź do logowania</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "already_verified") {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Konto już aktywne</CardTitle>
          <CardDescription>Ten adres e-mail był już wcześniej potwierdzony.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Przejdź do logowania</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error === "expired_token") {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Link wygasł</CardTitle>
          <CardDescription>
            Link weryfikacyjny jest nieważny lub wygasł (ważny 24 godziny).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resendState === "sent" && (
            <Alert className="border-green-500 text-green-700 bg-green-50">
              <AlertDescription>{resendMessage}</AlertDescription>
            </Alert>
          )}
          {resendState === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{resendMessage}</AlertDescription>
            </Alert>
          )}
          {resendState !== "sent" && (
            <Button
              onClick={handleResend}
              disabled={resendState === "loading"}
              className="w-full"
            >
              {resendState === "loading" ? "Wysyłanie..." : "Wyślij nowy link"}
            </Button>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Wróć do logowania</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // invalid_token, missing_token lub nieznany błąd
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Nieprawidłowy link</CardTitle>
        <CardDescription>
          Link weryfikacyjny jest nieprawidłowy lub już nie istnieje.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6 text-sm">
          Jeśli rejestrowałeś się niedawno, sprawdź czy nie masz nowszej wiadomości w skrzynce.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Wróć do logowania</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

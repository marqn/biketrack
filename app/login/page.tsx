"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "loading" | "sent" | "error">("idle");

  // Usuń #_=_ z URL po przekierowaniu z Facebooka
  useEffect(() => {
    if (window.location.hash === "#_=_") {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, []);

  // Przekieruj zalogowanych użytkowników
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error === "EMAIL_NOT_VERIFIED") {
          setPendingVerificationEmail(email);
          setError("Konto nie zostało jeszcze aktywowane. Sprawdź skrzynkę email lub wyślij nowy link.");
        } else if (result?.error) {
          setError("Nieprawidłowy email lub hasło");
        } else if (result?.ok) {
          window.location.href = "/";
        }
      } else {
        if (password !== confirmPassword) {
          setError("Hasła nie są identyczne");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Wystąpił błąd podczas rejestracji");
        } else {
          setPendingVerificationEmail(email);
          setSuccess("Konto utworzone! Sprawdź skrzynkę e-mail i kliknij link aktywacyjny.");
          setIsLogin(true);
          setPassword("");
          setConfirmPassword("");
          setName("");
        }
      }
    } catch (err) {
      setError("Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              🚴
            </div>
          </CardTitle>
          <CardTitle className="text-2xl">MBike.cc</CardTitle>
          <CardDescription>
            {isLogin
              ? "Zaloguj się, aby zarządzać serwisem swoich rowerów"
              : "Utwórz konto, aby rozpocząć"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Pokaż info jeśli użytkownik jest już zalogowany */}
          {status === "authenticated" && session && (
            <Alert className="mb-4">
              <AlertDescription>
                Jesteś zalogowany jako {session.user?.email} przez{" "}
                {session.user?.provider}.
                <Button
                  variant="link"
                  className="ml-2 p-0 h-auto text-primary"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Wyloguj się
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {pendingVerificationEmail && error?.includes("aktywowane") && (
            <div className="mb-4 text-center">
              {resendState === "sent" ? (
                <p className="text-sm text-green-700">Nowy link weryfikacyjny został wysłany.</p>
              ) : (
                <button
                  type="button"
                  disabled={resendState === "loading"}
                  onClick={async () => {
                    setResendState("loading");
                    try {
                      const res = await fetch("/api/auth/resend-verification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: pendingVerificationEmail }),
                      });
                      setResendState(res.ok ? "sent" : "error");
                    } catch {
                      setResendState("error");
                    }
                  }}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {resendState === "loading" ? "Wysyłanie..." : "Wyślij link ponownie"}
                </button>
              )}
            </div>
          )}

          {success && (
            <Alert className="mb-4 border-green-500 text-green-700 bg-green-50">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Imię (opcjonalne)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jan Kowalski"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Minimum 8 znaków
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Powtórz hasło</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Proszę czekać..."
                : isLogin
                  ? "Zaloguj się"
                  : "Utwórz konto"}
            </Button>
            {isLogin ? (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Nie masz konta? Zarejestruj się
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setSuccess("");
                }}
              >
                Powrót do logowania
              </Button>
            )}

            {isLogin && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Lub
                    </span>
                  </div>
                </div>

            <Button
              onClick={(e) => {
                e.preventDefault();
                signIn("google", { callbackUrl: "/" });
              }}
              variant="outline"
              className="w-full"
              type="button"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLogin ? "Zaloguj" : "Zarejestruj się"} przez Google
            </Button>

            <Button
              onClick={(e) => {
                e.preventDefault();
                signIn("facebook", { callbackUrl: "/", redirect: true });
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
              type="button"
            >
              <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {isLogin ? "Zaloguj" : "Zarejestruj się"} przez Facebook
            </Button>

            <Button
              onClick={(e) => {
                e.preventDefault();
                signIn("strava", { callbackUrl: "/" });
              }}
              className="w-full bg-[#FC4C02] hover:bg-[#e04400]"
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                <path
                  d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.627l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
                  fill="white"
                />
              </svg>
              {isLogin ? "Zaloguj" : "Zarejestruj się"} przez Strava
            </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TermsPage() {
  const router = useRouter();

  function handleBack() {
    if (window.opener) {
      window.close();
    } else {
      router.back();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </button>
          <CardTitle className="text-2xl">Regulamin korzystania z serwisu MBike</CardTitle>
          <CardDescription>Obowiązuje od 1 marca 2025 r.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 text-sm text-muted-foreground">
          <section className="space-y-2">
            <h2 className="font-semibold text-foreground text-base">§1. Postanowienia ogólne</h2>
            <p>
              Serwis MBike (dalej: „Serwis") to platforma internetowa do zarządzania rowerami,
              śledzenia przebiegu, planowania serwisowania części oraz budowania społeczności
              rowerzystów. Właścicielem i operatorem Serwisu jest Marqn (dalej: „Właściciel").
            </p>
            <p>
              Korzystanie z Serwisu – w tym przeglądanie, rejestracja i korzystanie z jakichkolwiek
              funkcji – oznacza bezwarunkową akceptację niniejszego Regulaminu.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground text-base">§2. Konto użytkownika</h2>
            <p>
              Rejestracja w Serwisie jest dobrowolna. Możliwa jest za pośrednictwem adresu e-mail
              i hasła lub kont zewnętrznych (Google, Facebook, Strava). Użytkownik zobowiązuje się
              do podania prawdziwych danych i do ochrony danych logowania.
            </p>
            <p>
              Niedozwolone jest tworzenie kont fałszywych, kont na dane innych osób, kont
              wielokrotnych lub kont w celach niezgodnych z przeznaczeniem Serwisu.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground text-base">§3. Dane i treści użytkownika</h2>
            <p>
              Użytkownik wyraża zgodę na to, że wszystkie dane podane w Serwisie — w tym dane
              profilu, informacje o rowerach, przebiegi, dane komponentów, komentarze oraz oceny
              produktów — mogą być wykorzystane przez Właściciela do celów analizy statystycznej
              oraz wyświetlania innym użytkownikom Serwisu.
            </p>
            <p>
              Treści oznaczone jako publiczne (rowery z włączoną widocznością publiczną, profile
              publiczne, komentarze, recenzje produktów) są widoczne dla wszystkich użytkowników
              Serwisu. Użytkownik może zarządzać widocznością swoich treści w ustawieniach profilu.
            </p>
            <p>
              Dane wrażliwe (hasło, adres e-mail) nie są udostępniane innym użytkownikom.
              Użytkownik jest odpowiedzialny za treści, które zamieszcza w Serwisie.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground text-base">§4. Zasady społeczności</h2>
            <p>
              Zabrania się publikowania treści obraźliwych, wulgarnych, niezgodnych z prawem,
              stanowiących spam lub nieuzasadnioną reklamę. Właściciel może moderować treści
              i usuwać konta naruszające Regulamin bez wcześniejszego ostrzeżenia.
            </p>
            <p>
              Komentarz zgłoszony przez trzech użytkowników zostaje automatycznie ukryty do czasu
              weryfikacji przez moderatora.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground text-base">§5. Plany płatne i dostępność Serwisu</h2>
            <p>
              Właściciel zastrzega sobie prawo do wyłączenia Serwisu lub dowolnej jego funkcji
              w dowolnym momencie, bez podania przyczyny i bez wcześniejszego powiadomienia.
            </p>
            <p>
              Opłaty za plan Premium są bezzwrotne. W przypadku zaprzestania działania Serwisu
              przez Właściciela użytkownikom nie przysługuje zwrot kosztów za niewykorzystany
              okres subskrypcji. Po anulowaniu subskrypcji dostęp do funkcji Premium
              obowiązuje do końca opłaconego okresu.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground text-base">§6. Odpowiedzialność</h2>
            <p>
              Serwis jest udostępniany w stanie „tak jak jest" (as is), bez jakichkolwiek gwarancji
              dostępności, poprawności ani kompletności danych. Właściciel nie odpowiada za przerwy
              w dostępności Serwisu ani za utratę danych.
            </p>
            <p>
              Informacje o serwisowaniu roweru zamieszczone w Serwisie mają charakter wyłącznie
              pomocniczy i nie zastępują konsultacji z profesjonalnym mechanikiem rowerowym.
              Użytkownik korzysta z Serwisu na własną odpowiedzialność.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground text-base">§7. Zmiany Regulaminu</h2>
            <p>
              Właściciel zastrzega sobie prawo do zmiany Regulaminu w dowolnym czasie.
              O istotnych zmianach użytkownicy zostaną poinformowani za pośrednictwem Serwisu.
              Dalsze korzystanie z Serwisu po opublikowaniu zmian oznacza ich akceptację.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground text-base">§8. Prawo właściwe</h2>
            <p>
              W sprawach nieuregulowanych niniejszym Regulaminem stosuje się przepisy prawa
              polskiego. Wszelkie spory wynikające z korzystania z Serwisu będą rozstrzygane przez
              sąd właściwy dla siedziby Właściciela.
            </p>
          </section>

          <p className="text-xs text-muted-foreground border-t pt-4">
            © {new Date().getFullYear()} MBike.cc Wszelkie prawa zastrzeżone.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

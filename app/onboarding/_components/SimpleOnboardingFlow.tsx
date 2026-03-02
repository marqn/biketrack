// app/onboarding/_components/SimpleOnboardingFlow.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { createBike } from "../_actions/createBike";
import { updateUnitPreference } from "@/app/app/actions/update-unit-preference";
import BikeBrandModelFields from "@/components/bike/BikeBrandModelFields";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import NumberStepper from "@/components/ui/number-stepper";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { BikeType } from "@/lib/generated/prisma";
import { bikeTypeLabels, BikeProduct } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import type { BrakeType } from "@/lib/default-parts";
import BikeConfigStep from "./BikeConfigStep";
import type { UnitPreference } from "@/lib/units";
import { detectUnitFromLocale } from "@/lib/units";

type Step = 1 | 2 | "config" | 3 | "units";

export default function SimpleOnboardingFlow() {
  const [step, setStep] = useState<Step>(1);
  const [unitPreference, setUnitPreference] = useState<UnitPreference>("METRIC");
  const [selectedType, setSelectedType] = useState<BikeType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedProduct, setSelectedProduct] = useState<BikeProduct | null>(null);
  const [isElectric, setIsElectric] = useState(false);
  const [brakeType, setBrakeType] = useState<BrakeType>("disc-hydraulic");
  const [hasSuspensionFork, setHasSuspensionFork] = useState(false);
  const [tubelessFront, setTubelessFront] = useState(false);
  const [tubelessRear, setTubelessRear] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Auto-detekcja locale przy starcie
  useEffect(() => {
    setUnitPreference(detectUnitFromLocale(navigator.language));
  }, []);

  function handleTypeSelect(type: BikeType) {
    setSelectedType(type);
    setStep(2);
  }

  function handleBackToType() {
    setStep(1);
    setSelectedType(null);
  }

  function handleDetailsNext() {
    setStep("config");
  }

  function handleDetailsSkip() {
    setBrand("");
    setModel("");
    setYear(new Date().getFullYear().toString());
    setSelectedProduct(null);
    setStep("config");
  }

  function handleBackToDetails() {
    setStep("config");
  }

  function handleTermsNext() {
    if (!termsAccepted) return;
    setStep("units");
  }

  function handleSubmit() {
    if (!selectedType) return;

    startTransition(async () => {
      await updateUnitPreference(unitPreference);
      await createBike({
        type: selectedType,
        brand: brand || null,
        model: model || null,
        year: year ? parseInt(year, 10) : null,
        bikeProductId: selectedProduct?.id || null,
        isElectric,
        brakeType,
        hasSuspensionFork,
        tubelessFront,
        tubelessRear,
      });
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {step === 1 && "Wybierz typ roweru"}
            {step === 2 && "Szczegóły roweru"}
            {step === "config" && "Konfiguracja"}
            {step === 3 && "Regulamin"}
            {step === "units" && "Jednostki"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 && "Jaki typ roweru chcesz śledzić?"}
            {step === 2 && "Podaj markę i model (opcjonalnie)"}
            {step === "config" && "Dostosuj ustawienia roweru (opcjonalnie)"}
            {step === 3 && "Zapoznaj się z regulaminem serwisu"}
            {step === "units" && "Wybierz preferowany system jednostek"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {step === 1 && (
            <div className="flex justify-center">
              <ToggleGroup
                type="single"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {Object.values(BikeType).map((type) => (
                  <ToggleGroupItem
                    key={type}
                    value={type}
                    onClick={() => handleTypeSelect(type)}
                    className="h-20 text-lg flex items-center justify-center text-center rounded-xl"
                  >
                    {bikeTypeLabels[type]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {step === 2 && (
            <>
              <button
                onClick={handleBackToType}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Zmień typ roweru
              </button>

              <BikeBrandModelFields
                brand={brand}
                model={model}
                onBrandChange={setBrand}
                onModelChange={setModel}
                onProductSelect={(product: BikeProduct | null) => {
                  setSelectedProduct(product);
                  if (product?.year) {
                    setYear(product.year.toString());
                  }
                }}
              />

              <div className="space-y-2">
                <Label>Rok modelowy</Label>
                <NumberStepper
                  value={year ? parseInt(year, 10) : new Date().getFullYear()}
                  onChange={(v) => setYear(v.toString())}
                  steps={[1]}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleDetailsNext}
                  className="w-full"
                  size="lg"
                >
                  Dalej
                </Button>

                <Button
                  onClick={handleDetailsSkip}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Pomiń
                </Button>
              </div>
            </>
          )}

          {step === "config" && (
            <BikeConfigStep
              brakeType={brakeType}
              hasSuspensionFork={hasSuspensionFork}
              tubelessFront={tubelessFront}
              tubelessRear={tubelessRear}
              isElectric={isElectric}
              onBrakeTypeChange={setBrakeType}
              onSuspensionForkChange={setHasSuspensionFork}
              onTubelessFrontChange={setTubelessFront}
              onTubelessRearChange={setTubelessRear}
              onIsElectricChange={setIsElectric}
              onNext={() => setStep(3)}
              onSkip={() => setStep(3)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 3 && (
            <>
              <button
                onClick={handleBackToDetails}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Wróć
              </button>

              <div className="h-60 custom-scrollbar overflow-y-auto rounded-md border p-4">
                <div className="text-sm text-muted-foreground space-y-4">
                  <p className="font-semibold text-foreground">Regulamin korzystania z serwisu MBike</p>

                  <div className="space-y-1">
                    <p className="font-medium text-foreground">§1. Postanowienia ogólne</p>
                    <p>Serwis MBike (dalej: &quot;Serwis&quot;) to platforma do zarządzania rowerami, śledzenia przebiegu, serwisowania części oraz budowania społeczności rowerzystów. Właścicielem i operatorem Serwisu jest Marqn. Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu.</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-foreground">§2. Konto użytkownika</p>
                    <p>Rejestracja jest dobrowolna. Użytkownik zobowiązuje się do podania prawdziwych danych oraz ochrony hasła. Niedozwolone jest tworzenie kont fałszywych, wielokrotnych lub w celach niezgodnych z przeznaczeniem Serwisu.</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-foreground">§3. Dane i treści użytkownika</p>
                    <p>Użytkownik wyraża zgodę na wykorzystanie przez Właściciela wszystkich danych podanych w Serwisie — w tym danych profilu, rowerów, przebiegów, komponentów, komentarzy i ocen produktów — do celów analizy statystycznej oraz wyświetlania innym użytkownikom Serwisu. Treści publiczne (rowery z włączoną widocznością, profile publiczne, komentarze, recenzje) są widoczne dla innych użytkowników. Dane wrażliwe (hasło, adres e-mail) nie są udostępniane innym użytkownikom.</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-foreground">§4. Zasady społeczności</p>
                    <p>Zabrania się publikowania treści obraźliwych, niezgodnych z prawem, spamu lub reklam. Właściciel może moderować treści i usuwać konta naruszające zasady bez wcześniejszego ostrzeżenia. Komentarz zgłoszony trzykrotnie zostaje automatycznie ukryty.</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-foreground">§5. Plany płatne i dostępność Serwisu</p>
                    <p>Właściciel zastrzega sobie prawo do wyłączenia Serwisu lub dowolnej jego funkcji w dowolnym momencie, bez podania przyczyny. Opłaty za plan Premium są bezzwrotne. W przypadku zaprzestania działania Serwisu nie przysługuje zwrot za niewykorzystany okres subskrypcji. Subskrypcja obowiązuje do końca opłaconego okresu po anulowaniu.</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-foreground">§6. Odpowiedzialność</p>
                    <p>Serwis jest udostępniany w stanie &quot;tak jak jest&quot; (as is). Informacje o serwisowaniu roweru mają charakter wyłącznie pomocniczy i nie zastępują konsultacji z profesjonalnym mechanikiem rowerowym. Właściciel nie odpowiada za przerwy w dostępności, utratę danych ani szkody wynikające z korzystania z Serwisu.</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-foreground">§7. Zmiany Regulaminu</p>
                    <p>Właściciel może zmieniać Regulamin. O istotnych zmianach użytkownicy zostaną poinformowani przez Serwis. Dalsze korzystanie z Serwisu po opublikowaniu zmian oznacza ich akceptację.</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-foreground">§8. Prawo właściwe</p>
                    <p>W sprawach nieuregulowanych niniejszym Regulaminem stosuje się prawo polskie. Spory rozstrzygane będą przez sąd właściwy dla siedziby Właściciela.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.open('/terms', '_blank')}
                    className="text-primary hover:underline text-left"
                  >
                    Pełna wersja regulaminu →
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms-accepted"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                />
                <Label htmlFor="terms-accepted" className="cursor-pointer text-sm">
                  Zapoznałem/am się z regulaminem i akceptuję jego postanowienia
                </Label>
              </div>

              <Button
                onClick={handleTermsNext}
                disabled={!termsAccepted}
                className="w-full"
                size="lg"
              >
                Dalej
              </Button>
            </>
          )}

          {step === "units" && (
            <>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Wróć
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setUnitPreference("METRIC")}
                  className={`flex-1 py-4 px-4 rounded-xl border-2 transition-colors ${
                    unitPreference === "METRIC"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-xl font-bold">km / kg</div>
                  <div className="text-sm text-muted-foreground mt-1">Metryczny</div>
                </button>
                <button
                  onClick={() => setUnitPreference("IMPERIAL")}
                  className={`flex-1 py-4 px-4 rounded-xl border-2 transition-colors ${
                    unitPreference === "IMPERIAL"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-xl font-bold">mi / lbs</div>
                  <div className="text-sm text-muted-foreground mt-1">Imperialny</div>
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Możesz to zmienić później w ustawieniach profilu
              </p>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? "Tworzenie..." : "Zacznij korzystać"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

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
import type { UnitPreference } from "@/lib/units";
import { detectUnitFromLocale } from "@/lib/units";

type Step = 1 | 2 | 3 | "units";

export default function SimpleOnboardingFlow() {
  const [step, setStep] = useState<Step>(1);
  const [unitPreference, setUnitPreference] = useState<UnitPreference>("METRIC");
  const [selectedType, setSelectedType] = useState<BikeType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedProduct, setSelectedProduct] = useState<BikeProduct | null>(null);
  const [isElectric, setIsElectric] = useState(false);
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
    setStep(3);
  }

  function handleDetailsSkip() {
    setBrand("");
    setModel("");
    setYear(new Date().getFullYear().toString());
    setSelectedProduct(null);
    setStep(3);
  }

  function handleBackToDetails() {
    setStep(2);
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
            {step === 3 && "Regulamin"}
            {step === "units" && "Jednostki"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 && "Jaki typ roweru chcesz śledzić?"}
            {step === 2 && "Podaj markę i model (opcjonalnie)"}
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-electric"
                  checked={isElectric}
                  onCheckedChange={(checked) => setIsElectric(checked === true)}
                />
                <Label htmlFor="is-electric" className="cursor-pointer">
                  Rower elektryczny (e-bike)
                </Label>
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
                <div className="text-sm text-muted-foreground space-y-3">
                  <p className="font-semibold text-foreground">Regulamin korzystania z serwisu MBike</p>
                  <p>1. Serwis MBike służy do zarządzania rowerami, śledzenia przebiegu oraz planowania serwisowania części rowerowych.</p>
                  <p>2. Użytkownik zobowiązuje się do podawania prawdziwych informacji dotyczących swoich rowerów i ich stanu technicznego.</p>
                  <p>3. Dane użytkownika są przechowywane zgodnie z polityką prywatności i nie są udostępniane osobom trzecim bez zgody użytkownika.</p>
                  <p>4. Użytkownik ponosi pełną odpowiedzialność za stan techniczny swojego roweru. Informacje o serwisowaniu mają charakter wyłącznie pomocniczy.</p>
                  <p>5. Zabrania się wykorzystywania serwisu w sposób niezgodny z jego przeznaczeniem, w tym publikowania treści obraźliwych lub niezgodnych z prawem.</p>
                  <p>6. Administracja zastrzega sobie prawo do usunięcia konta użytkownika w przypadku naruszenia regulaminu.</p>
                  <p>7. Serwis jest udostępniany w stanie &quot;tak jak jest&quot; (as is). Administracja nie ponosi odpowiedzialności za ewentualne przerwy w działaniu serwisu.</p>
                  <p>8. Regulamin może ulec zmianie. O istotnych zmianach użytkownicy zostaną poinformowani za pośrednictwem serwisu.</p>
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

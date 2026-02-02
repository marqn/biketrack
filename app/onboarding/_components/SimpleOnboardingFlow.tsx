// app/onboarding/_components/SimpleOnboardingFlow.tsx
"use client";

import { useState, useTransition } from "react";
import { createBike } from "../_actions/createBike";
import BikeBrandModelFields from "@/components/bike/BikeBrandModelFields";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BikeType } from "@/lib/generated/prisma";
import { bikeTypeLabels, BikeProduct } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function SimpleOnboardingFlow() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<BikeType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<BikeProduct | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleTypeSelect(type: BikeType) {
    setSelectedType(type);
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setSelectedType(null);
  }

  function handleSubmit() {
    if (!selectedType) return;

    startTransition(async () => {
      await createBike({
        type: selectedType,
        brand: brand || null,
        model: model || null,
        year: year ? parseInt(year, 10) : null,
        bikeProductId: selectedProduct?.id || null,
      });
    });
  }

  function handleSkip() {
    if (!selectedType) return;

    startTransition(async () => {
      await createBike({
        type: selectedType,
        brand: null,
        model: null,
        year: null,
      });
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {step === 1 ? "Witaj! 🚴" : "Szczegóły roweru"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1
              ? "Wybierz typ swojego roweru"
              : "Podaj markę i model (opcjonalnie)"}
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
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isPending}
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
                <Label htmlFor="bike-year">Rok modelowy</Label>
                <Input
                  id="bike-year"
                  type="number"
                  placeholder="np. 2023"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full"
                  size="lg"
                >
                  {isPending ? "Tworzenie..." : "Dalej"}
                </Button>

                <Button
                  onClick={handleSkip}
                  disabled={isPending}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Pomiń
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

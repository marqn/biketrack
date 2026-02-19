// app/onboarding/_components/SimpleOnboardingFlow.tsx
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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
import { Label } from "@/components/ui/label";
import NumberStepper from "@/components/ui/number-stepper";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { BikeType } from "@/lib/generated/prisma";
import { BikeProduct } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function SimpleOnboardingFlow() {
  const t = useTranslations("onboarding");
  const tBikeTypes = useTranslations("bikeTypes");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<BikeType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedProduct, setSelectedProduct] = useState<BikeProduct | null>(null);
  const [isElectric, setIsElectric] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [termsAccepted, setTermsAccepted] = useState(false);

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

  function handleSubmit() {
    if (!selectedType || !termsAccepted) return;

    startTransition(async () => {
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
            {step === 1 && t("welcome")}
            {step === 2 && t("bikeDetails")}
            {step === 3 && t("terms")}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 && t("chooseBikeType")}
            {step === 2 && t("enterBrandModelOptional")}
            {step === 3 && t("reviewTerms")}
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
                    {tBikeTypes(type)}
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
                {t("changeBikeType")}
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
                <Label>{t("modelYear")}</Label>
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
                  {t("electricBike")}
                </Label>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleDetailsNext}
                  className="w-full"
                  size="lg"
                >
                  {t("next")}
                </Button>

                <Button
                  onClick={handleDetailsSkip}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {t("skip")}
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
                {t("goBack")}
              </button>

              <div className="h-60 custom-scrollbar overflow-y-auto rounded-md border p-4">
                <div className="text-sm text-muted-foreground space-y-3">
                  <p className="font-semibold text-foreground">{t("termsTitle")}</p>
                  <p>{t("termsRule1")}</p>
                  <p>{t("termsRule2")}</p>
                  <p>{t("termsRule3")}</p>
                  <p>{t("termsRule4")}</p>
                  <p>{t("termsRule5")}</p>
                  <p>{t("termsRule6")}</p>
                  <p>{t("termsRule7")}</p>
                  <p>{t("termsRule8")}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms-accepted"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                />
                <Label htmlFor="terms-accepted" className="cursor-pointer text-sm">
                  {t("termsAcceptLabel")}
                </Label>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!termsAccepted || isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? t("creating") : t("next")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

// app/onboarding/strava-sync/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
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
import NumberStepper from "@/components/ui/number-stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";
import { BikeType } from "@/lib/generated/prisma";
import { BikeProduct } from "@/lib/types";
import { syncStravaBikes } from "./sync-strava-bikes";
import { createBike } from "./actions";
import BikeBrandModelFields from "@/components/bike/BikeBrandModelFields";

interface StravaBike {
  id: string;
  name: string;
  distance: number;
  brand_name: string | null;
  model_name: string | null;
  description: string | null;
  weight: number | null;
  primary: boolean;
}

export default function StravaOnboardingPage() {
  const t = useTranslations("onboarding");
  const tBikeTypes = useTranslations("bikeTypes");
  const [loading, setLoading] = useState(true);
  const [stravaBikes, setStravaBikes] = useState<StravaBike[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string>("");
  const [selectedBike, setSelectedBike] = useState<StravaBike | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<BikeType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isElectric, setIsElectric] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    loadStravaBikes();
  }, []);

  async function loadStravaBikes() {
    setLoading(true);
    try {
      const bikes = await syncStravaBikes();
      setStravaBikes(bikes);
    } catch (error) {
      console.error("Error fetching bikes:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleBikeSelect(bikeId: string) {
    setSelectedBikeId(bikeId);
    const bike = stravaBikes.find((b) => b.id === bikeId);
    setSelectedBike(bike || null);
    if (bike) {
      setBrand(bike.brand_name || "");
      setModel(bike.model_name || "");
      setStep(2);
    }
  }

  function handleTypeSelect(type: BikeType) {
    setSelectedType(type);
    setStep(3);
  }

  function handleDetailsNext() {
    setStep(4);
  }

  function handleDetailsSkip() {
    setBrand("");
    setModel("");
    setYear(new Date().getFullYear().toString());
    setStep(4);
  }

  function handleBackToStrava() {
    setStep(1);
    setSelectedType(null);
  }

  function handleBackToType() {
    setStep(2);
  }

  function handleBackToDetails() {
    setStep(3);
  }

  function handleSubmit() {
    if (!selectedType || !selectedBike || !termsAccepted) return;

    startTransition(async () => {
      await createBike({
        type: selectedType,
        brand: brand || null,
        model: model || null,
        year: year ? parseInt(year, 10) : null,
        totalKm: selectedBike.distance
          ? Math.round(selectedBike.distance / 1000)
          : 0,
        isElectric,
        stravaGearId: selectedBike.id,
      });
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {t("fetchingStravaBikes")}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {step === 1 && t("stravaWelcome")}
            {step === 2 && t("bikeType")}
            {step === 3 && t("bikeDetails")}
            {step === 4 && t("terms")}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 &&
              (stravaBikes.length > 0 ? (
                <>
                  {t("stravaFoundBikes", { count: stravaBikes.length })}
                </>
              ) : (
                t("stravaNoBikes")
              ))}
            {step === 2 && t("chooseBikeType")}
            {step === 3 && t("enterBrandModelOptional")}
            {step === 4 && t("reviewTerms")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && stravaBikes.length > 0 && (
            <div className="space-y-2">
              <Label>{t("selectBike")}</Label>
              <Select value={selectedBikeId} onValueChange={handleBikeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectBikeFromStrava")} />
                </SelectTrigger>
                <SelectContent>
                  {stravaBikes.map((bike) => (
                    <SelectItem key={bike.id} value={bike.id}>
                      {bike.name} - {Math.round(bike.distance / 1000)} km
                      {bike.primary && " \u2B50"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <>
              <button
                onClick={handleBackToStrava}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("changeBike")}
              </button>
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
            </>
          )}

          {step === 3 && (
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

              {selectedBike && (
                <div className="space-y-2">
                  <Label>{t("mileageKm")}</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedBike.distance / 1000)}
                    disabled
                  />
                </div>
              )}

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

          {step === 4 && (
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

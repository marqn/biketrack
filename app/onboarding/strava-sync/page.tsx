// app/onboarding/strava-sync/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
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
import { bikeTypeLabels, BikeProduct } from "@/lib/types";
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
  const [loading, setLoading] = useState(true);
  const [stravaBikes, setStravaBikes] = useState<StravaBike[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string>("");
  const [selectedBike, setSelectedBike] = useState<StravaBike | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<BikeType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isElectric, setIsElectric] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadStravaBikes();
  }, []);

  async function loadStravaBikes() {
    setLoading(true);
    try {
      const bikes = await syncStravaBikes();
      setStravaBikes(bikes);
    } catch (error) {
      console.error("Błąd pobierania rowerów:", error);
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

  function handleBackToStrava() {
    setStep(1);
    setSelectedType(null);
  }

  function handleBackToType() {
    setStep(2);
  }

  function handleSubmit() {
    if (!selectedType || !selectedBike) return;

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
      });
    });
  }

  function handleSkip() {
    if (!selectedType || !selectedBike) return;

    startTransition(async () => {
      await createBike({
        type: selectedType,
        brand: null,
        model: null,
        year: null,
        totalKm: selectedBike.distance
          ? Math.round(selectedBike.distance / 1000)
          : 0,
        isElectric,
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
              Pobieranie rowerów ze Strava...
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
            {step === 1 && "Witaj! 🚴"}
            {step === 2 && "Typ roweru"}
            {step === 3 && "Szczegóły roweru"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 &&
              (stravaBikes.length > 0 ? (
                <>
                  Znaleźliśmy {stravaBikes.length} rower
                  {stravaBikes.length === 1
                    ? ""
                    : stravaBikes.length < 5
                      ? "y"
                      : "ów"}{" "}
                  w Twoim koncie Strava
                </>
              ) : (
                "Nie znaleźliśmy rowerów w Twoim koncie Strava"
              ))}
            {step === 2 && "Wybierz typ swojego roweru"}
            {step === 3 && "Podaj markę i model (opcjonalnie)"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Krok 1: Wybór roweru ze Strava */}
          {step === 1 && stravaBikes.length > 0 && (
            <div className="space-y-2">
              <Label>Wybierz rower</Label>
              <Select value={selectedBikeId} onValueChange={handleBikeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz rower ze Strava" />
                </SelectTrigger>
                <SelectContent>
                  {stravaBikes.map((bike) => (
                    <SelectItem key={bike.id} value={bike.id}>
                      {bike.name} - {Math.round(bike.distance / 1000)} km
                      {bike.primary && " 🌟"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Krok 2: Wybór typu roweru */}
          {step === 2 && (
            <>
              <button
                onClick={handleBackToStrava}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Zmień rower
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
                      {bikeTypeLabels[type]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </>
          )}

          {/* Krok 3: Szczegóły roweru */}
          {step === 3 && (
            <>
              <button
                onClick={handleBackToType}
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

              {selectedBike && (
                <div className="space-y-2">
                  <Label>Przebieg (km)</Label>
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
                  Rower elektryczny (e-bike)
                </Label>
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

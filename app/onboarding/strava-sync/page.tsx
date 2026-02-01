// app/onboarding/strava/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { BikeType } from "@/lib/generated/prisma";
import BikeTypeSelector from "../_components/BikeTypeSelector";
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
  }

  async function handleTypeSelect(type: BikeType) {
    if (!selectedBike) return;

    await createBike({
      type,
      brand: selectedBike.brand_name,
      model: selectedBike.model_name,
      totalKm: selectedBike.distance
        ? Math.round(selectedBike.distance / 1000)
        : 0,
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
          <CardTitle className="text-2xl">Witaj! 🚴</CardTitle>
          <CardDescription className="text-base">
            {stravaBikes.length > 0 ? (
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
              "Nie znaleźliśmy rowerów w Twoim koncie Strava. Możesz dodać nowy."
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {stravaBikes.length > 0 && (
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

          {selectedBike && (
            <>
              <BikeBrandModelFields
                brand={selectedBike.brand_name || ""}
                model={selectedBike.model_name || ""}
                onBrandChange={(brand) =>
                  setSelectedBike({ ...selectedBike, brand_name: brand })
                }
                onModelChange={(model) =>
                  setSelectedBike({ ...selectedBike, model_name: model })
                }
                onProductSelect={() => {}}
              />

              <div className="space-y-2">
                <Label>Przebieg (km)</Label>
                <Input
                  type="number"
                  value={Math.round(selectedBike.distance / 1000)}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label>Typ roweru</Label>
                <BikeTypeSelector
                  onSelectType={handleTypeSelect}
                  disabled={!selectedBike}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
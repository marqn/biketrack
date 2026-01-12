"use client";

import { useState, useTransition, useEffect } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import { syncStravaBikes } from "../sync-strava-bikes";
import { Loader2 } from "lucide-react";
import { BikeType } from "@/lib/generated/prisma/wasm";
import { bikeTypeLabels } from "@/lib/types";
import { createBike } from "./actions";

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

const StravaSyncPage: React.FC = () => {
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
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
      console.log("Pobrane rowery ze Strava:", bikes);
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

  function handleSelect(type: BikeType) {
    startTransition(async () => {
      await createBike({
        type,
        brand: selectedBike?.brand_name || null,
        model: selectedBike?.model_name || null,
        totalKm: selectedBike?.distance 
          ? Math.round(selectedBike.distance / 1000) 
          : null,
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

  if (stravaBikes.length > 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Witaj! 🚴</CardTitle>
            <CardDescription className="text-base">
              Znaleźliśmy {stravaBikes.length} rower
              {stravaBikes.length === 1
                ? ""
                : stravaBikes.length < 5
                ? "y"
                : "ów"}{" "}
              w Twoim koncie Strava
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
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

            {selectedBike && (
              <>
                <div className="space-y-2">
                  <Label>Marka</Label>
                  <Input
                    value={selectedBike.brand_name || ""}
                    onChange={(e) =>
                      setSelectedBike({
                        ...selectedBike,
                        brand_name: e.target.value,
                      })
                    }
                    placeholder="Np. Trek, Specialized..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={selectedBike.model_name || ""}
                    onChange={(e) =>
                      setSelectedBike({
                        ...selectedBike,
                        model_name: e.target.value,
                      })
                    }
                    placeholder="Np. Domane SL 7"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opis</Label>
                  <Input
                    value={selectedBike.description || ""}
                    onChange={(e) =>
                      setSelectedBike({
                        ...selectedBike,
                        description: e.target.value,
                      })
                    }
                    placeholder="Opcjonalny opis"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Waga (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedBike.weight || ""}
                    onChange={(e) =>
                      setSelectedBike({
                        ...selectedBike,
                        weight: parseFloat(e.target.value) || null,
                      })
                    }
                    placeholder="Np. 8.5"
                  />
                </div>

                <Card className="w-full max-w-md">
                  <CardContent>
                    <ToggleGroup
                      type="single"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto"
                    >
                      {Object.values(BikeType).map((type) => (
                        <ToggleGroupItem
                          key={type}
                          value={type}
                          onClick={() => handleSelect(type)}
                          className="h-20 text-lg flex items-center justify-center text-center rounded-xl"
                        >
                          {bikeTypeLabels[type]}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    );
  }
};

export default StravaSyncPage;
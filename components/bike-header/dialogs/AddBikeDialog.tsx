"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import NumberStepper from "@/components/ui/number-stepper";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BikeType } from "@/lib/generated/prisma";
import { bikeTypeLabels, BikeProduct } from "@/lib/types";
import BikeBrandModelFields from "@/components/bike/BikeBrandModelFields";
import { addBike } from "../actions/add-bike";
import {
  getAvailableStravaBikes,
  StravaBikeForImport,
} from "../actions/get-strava-bikes";
import { updateUnitPreference } from "@/app/app/actions/update-unit-preference";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import type { UnitPreference } from "@/lib/units";
import { detectUnitFromLocale } from "@/lib/units";

interface AddBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBikeAdded?: (bikeId: string) => void;
  /** Czy to dodawanie pierwszego roweru przez istniejącego usera bez ustawionej preferencji */
  showUnitsStep?: boolean;
}

type Step = "units" | "loading" | "strava" | "type" | "details";

export function AddBikeDialog({
  open,
  onOpenChange,
  onBikeAdded,
  showUnitsStep = false,
}: AddBikeDialogProps) {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [step, setStep] = useState<Step>("loading");
  const [unitPreference, setUnitPreference] = useState<UnitPreference>("METRIC");
  const [stravaBikes, setStravaBikes] = useState<StravaBikeForImport[]>([]);
  const [selectedStravaBike, setSelectedStravaBike] =
    useState<StravaBikeForImport | null>(null);
  const [selectedType, setSelectedType] = useState<BikeType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedProduct, setSelectedProduct] = useState<BikeProduct | null>(
    null
  );
  const [isElectric, setIsElectric] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Pobierz rowery ze Stravy gdy dialog się otworzy
  useEffect(() => {
    if (open) {
      // Jeśli showUnitsStep - pokaż krok jednostek jako pierwszy
      if (showUnitsStep) {
        setUnitPreference(detectUnitFromLocale(navigator.language));
        setStep("units");
      } else {
        loadStravaBikes();
      }
    }
  }, [open]);

  async function loadStravaBikes() {
    setStep("loading");
    try {
      const result = await getAvailableStravaBikes();
      if (result.success && result.isPremium && result.bikes.length > 0) {
        setStravaBikes(result.bikes);
        setStep("strava");
      } else {
        // Brak rowerów ze Stravy lub user nie jest premium - standardowy flow
        setStravaBikes([]);
        setStep("type");
      }
    } catch {
      setStravaBikes([]);
      setStep("type");
    }
  }

  async function handleUnitsNext() {
    await updateUnitPreference(unitPreference);
    await updateSession();
    loadStravaBikes();
  }

  function resetForm() {
    setStep("loading");
    setStravaBikes([]);
    setSelectedStravaBike(null);
    setSelectedType(null);
    setBrand("");
    setModel("");
    setYear(new Date().getFullYear().toString());
    setSelectedProduct(null);
    setIsElectric(false);
    setError(null);
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm();
    onOpenChange(open);
  }

  function handleStravaBikeSelect(bike: StravaBikeForImport) {
    setSelectedStravaBike(bike);
    // Wypełnij dane z roweru Strava
    setBrand(bike.brand_name || "");
    setModel(bike.model_name || "");
    setStep("type");
  }

  function handleAddManually() {
    setSelectedStravaBike(null);
    setBrand("");
    setModel("");
    setStep("type");
  }

  function handleTypeSelect(type: BikeType) {
    setSelectedType(type);
    setStep("details");
  }

  function handleBackToStrava() {
    if (stravaBikes.length > 0) {
      setSelectedStravaBike(null);
      setBrand("");
      setModel("");
      setStep("strava");
    }
  }

  function handleBackToType() {
    setStep("type");
  }

  function handleSubmit() {
    if (!selectedType) return;
    setError(null);

    startTransition(async () => {
      const result = await addBike({
        type: selectedType,
        brand: brand || null,
        model: model || null,
        year: year ? parseInt(year, 10) : null,
        bikeProductId: selectedProduct?.id || null,
        isElectric,
        stravaGearId: selectedStravaBike?.id || null,
        totalKm: selectedStravaBike
          ? Math.round(selectedStravaBike.distance / 1000)
          : 0,
      });

      if (result.success && result.bikeId) {
        document.cookie = `selectedBikeId=${result.bikeId};path=/;max-age=${60 * 60 * 24 * 365}`;
        onBikeAdded?.(result.bikeId);
        handleOpenChange(false);
        const bikeName = [brand, model].filter(Boolean).join(" ");
        toast.success("Dodano nowy rower", {
          description: bikeName || undefined,
        });
        router.refresh();
      } else {
        setError(result.error || "Wystąpił błąd");
      }
    });
  }

  function handleSkip() {
    if (!selectedType) return;
    setError(null);

    startTransition(async () => {
      const result = await addBike({
        type: selectedType,
        brand: null,
        model: null,
        year: null,
        isElectric,
        stravaGearId: selectedStravaBike?.id || null,
        totalKm: selectedStravaBike
          ? Math.round(selectedStravaBike.distance / 1000)
          : 0,
      });

      if (result.success && result.bikeId) {
        document.cookie = `selectedBikeId=${result.bikeId};path=/;max-age=${60 * 60 * 24 * 365}`;
        onBikeAdded?.(result.bikeId);
        handleOpenChange(false);
        toast.success("Dodano nowy rower");
        router.refresh();
      } else {
        setError(result.error || "Wystąpił błąd");
      }
    });
  }

  function getTitle() {
    switch (step) {
      case "units":
        return "Jednostki";
      case "loading":
        return "Dodaj nowy rower";
      case "strava":
        return "Importuj ze Strava";
      case "type":
        return "Wybierz typ roweru";
      case "details":
        return "Szczegóły roweru";
    }
  }

  function getDescription() {
    switch (step) {
      case "units":
        return "Wybierz preferowany system jednostek";
      case "loading":
        return "Sprawdzanie dostępnych rowerów...";
      case "strava":
        return `Znaleźliśmy ${stravaBikes.length} ${stravaBikes.length === 1 ? "rower" : stravaBikes.length < 5 ? "rowery" : "rowerów"} w Twoim koncie Strava`;
      case "type":
        return selectedStravaBike
          ? `${selectedStravaBike.name} - wybierz typ`
          : "Wybierz typ nowego roweru";
      case "details":
        return "Podaj markę i model (opcjonalnie)";
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 ">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Krok wyboru jednostek */}
          {step === "units" && (
            <div className="space-y-4">
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
              <Button onClick={handleUnitsNext} className="w-full">
                Dalej
              </Button>
            </div>
          )}

          {/* Loading */}
          {step === "loading" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Krok Strava - wybór roweru ze Strava */}
          {step === "strava" && (
            <div className="space-y-3">
              {stravaBikes.map((bike) => (
                <button
                  key={bike.id}
                  onClick={() => handleStravaBikeSelect(bike)}
                  className="w-full p-4 text-left border rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {bike.name}
                        {bike.primary && (
                          <span className="ml-2 text-yellow-500">★</span>
                        )}
                      </p>
                      {(bike.brand_name || bike.model_name) && (
                        <p className="text-sm text-muted-foreground">
                          {[bike.brand_name, bike.model_name]
                            .filter(Boolean)
                            .join(" ")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(bike.distance / 1000)} km
                    </span>
                  </div>
                </button>
              ))}

              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={handleAddManually}
                  className="w-full"
                >
                  Dodaj ręcznie
                </Button>
              </div>
            </div>
          )}

          {/* Krok 1 - wybór typu */}
          {step === "type" && (
            <>
              {stravaBikes.length > 0 && (
                <button
                  onClick={handleBackToStrava}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Wróć do wyboru ze Strava
                </button>
              )}
              <div className="flex justify-center">
                <ToggleGroup type="single" className="grid grid-cols-2 gap-3 ">
                  {Object.values(BikeType).map((type) => (
                    <ToggleGroupItem
                      key={type}
                      value={type}
                      onClick={() => handleTypeSelect(type)}
                      className="h-16 text-base text-center rounded-xl"
                    >
                      {bikeTypeLabels[type]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

              </div>
            </>
          )}

          {/* Krok 2 - szczegóły */}
          {step === "details" && (
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
                  disabled={isPending}
                />
              </div>

              {selectedStravaBike && (
                <div className="space-y-2">
                  <Label>Przebieg (km)</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedStravaBike.distance / 1000)}
                    disabled
                  />
                </div>
              )}

              {selectedType !== BikeType.TRAINER && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-bike-electric"
                    checked={isElectric}
                    onCheckedChange={(checked) => setIsElectric(checked === true)}
                    disabled={isPending}
                  />
                  <Label htmlFor="new-bike-electric" className="cursor-pointer">
                    Rower elektryczny (e-bike)
                  </Label>
                </div>
              )}

              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Dodawanie..." : "Dodaj rower"}
                </Button>
                <Button
                  onClick={handleSkip}
                  disabled={isPending}
                  variant="outline"
                  className="w-full"
                >
                  Pomiń szczegóły
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useTransition } from "react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BikeType } from "@/lib/generated/prisma";
import { bikeTypeLabels, BikeProduct } from "@/lib/types";
import BikeBrandModelFields from "@/components/bike/BikeBrandModelFields";
import { addBike } from "../actions/add-bike";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBikeAdded?: (bikeId: string) => void;
}

export function AddBikeDialog({
  open,
  onOpenChange,
  onBikeAdded,
}: AddBikeDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<BikeType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedProduct, setSelectedProduct] = useState<BikeProduct | null>(null);
  const [isElectric, setIsElectric] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setStep(1);
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

  function handleTypeSelect(type: BikeType) {
    setSelectedType(type);
    setStep(2);
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
      });

      if (result.success && result.bikeId) {
        // Ustaw cookie z nowym rowerem i odśwież
        document.cookie = `selectedBikeId=${result.bikeId};path=/;max-age=${60 * 60 * 24 * 365}`;
        onBikeAdded?.(result.bikeId);
        handleOpenChange(false);
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
      });

      if (result.success && result.bikeId) {
        document.cookie = `selectedBikeId=${result.bikeId};path=/;max-age=${60 * 60 * 24 * 365}`;
        onBikeAdded?.(result.bikeId);
        handleOpenChange(false);
        router.refresh();
      } else {
        setError(result.error || "Wystąpił błąd");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Dodaj nowy rower" : "Szczegóły roweru"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Wybierz typ nowego roweru"
              : "Podaj markę i model (opcjonalnie)"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {step === 1 && (
            <ToggleGroup
              type="single"
              className="grid grid-cols-2 gap-3"
            >
              {Object.values(BikeType).map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  onClick={() => handleTypeSelect(type)}
                  className="h-16 text-base flex items-center justify-center text-center rounded-xl"
                >
                  {bikeTypeLabels[type]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
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
                <Label htmlFor="new-bike-year">Rok modelowy</Label>
                <Input
                  id="new-bike-year"
                  type="number"
                  placeholder="np. 2023"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  disabled={isPending}
                />
              </div>

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

              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

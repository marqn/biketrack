"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BikeType } from "@/lib/generated/prisma";
import { bikeTypeLabels, BikeProduct } from "@/lib/types";
import BikeBrandModelFields from "@/components/bike/BikeBrandModelFields";

interface RenameBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: {
    id: string;
    brand?: string | null;
    model?: string | null;
    year?: number | null;
    type: BikeType;
  };
  onSave: (data: {
    brand: string;
    model: string;
    year: number | null;
    type: BikeType;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function RenameBikeDialog({
  open,
  onOpenChange,
  bike,
  onSave,
}: RenameBikeDialogProps) {
  const [brand, setBrand] = useState(bike.brand ?? "");
  const [model, setModel] = useState(bike.model ?? "");
  const [year, setYear] = useState(bike.year?.toString() ?? "2026");
  const [type, setType] = useState<BikeType>(bike.type);

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await onSave({
        brand,
        model,
        year: year ? parseInt(year, 10) : null,
        type,
      });

      if (result.success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Błąd:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset formularza gdy dialog się otwiera
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setBrand(bike.brand ?? "");
      setModel(bike.model ?? "");
      setYear(bike.year?.toString() ?? "");
      setType(bike.type);
    }
    onOpenChange(open);
  };

  const handleProductSelect = (product: BikeProduct | null) => {
    if (product?.year) {
      setYear(product.year.toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edytuj rower</DialogTitle>
          <DialogDescription>
            Typ roweru jest wymagany. Marka i model są opcjonalne, ale pomagają
            w dopasowaniu komponentów.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bike-type">
              Typ roweru <span className="text-destructive">*</span>
            </Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as BikeType)}
              disabled={isLoading}
            >
              <SelectTrigger id="bike-type">
                <SelectValue placeholder="Wybierz typ roweru" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(bikeTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <BikeBrandModelFields
            brand={brand}
            model={model}
            onBrandChange={setBrand}
            onModelChange={setModel}
            onProductSelect={handleProductSelect}
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
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Dzięki temu będziemy mogli zaproponować konkretne komponenty
              dopasowane do tego modelu.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

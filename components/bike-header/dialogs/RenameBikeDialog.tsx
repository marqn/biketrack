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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
    isElectric?: boolean;
    description?: string | null;
  };
  onSave: (data: {
    brand: string;
    model: string;
    year: number | null;
    type: BikeType;
    isElectric: boolean;
    description: string;
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
  const [year, setYear] = useState(bike.year?.toString() ?? new Date().getFullYear().toString());
  const [type, setType] = useState<BikeType>(bike.type);
  const [isElectric, setIsElectric] = useState(bike.isElectric ?? false);
  const [description, setDescription] = useState(bike.description ?? "");

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await onSave({
        brand,
        model,
        year: year ? parseInt(year, 10) : null,
        type,
        isElectric,
        description,
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
      setIsElectric(bike.isElectric ?? false);
      setDescription(bike.description ?? "");
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
      <DialogContent className="max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edytuj rower</DialogTitle>
          <DialogDescription>
            Typ roweru jest wymagany. Marka i model są opcjonalne, ale pomagają
            w dopasowaniu komponentów.
          </DialogDescription>
        </DialogHeader>

        <div
          className="custom-scrollbar space-y-4 overflow-y-auto -mx-6 pl-6 pr-8"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="bike-type">
                Typ roweru <span className="text-destructive">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as BikeType)}
                disabled={isLoading}
              >
                <SelectTrigger id="bike-type" className="w-36">
                  <SelectValue placeholder="Wybierz typ" />
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

            <div className="space-y-2">
              <Label htmlFor="bike-year">Rok</Label>
              <Input
                id="bike-year"
                type="number"
                placeholder="2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={1990}
                max={new Date().getFullYear() + 1}
                disabled={isLoading}
                className="w-24"
              />
            </div>

            <div className="flex items-center space-x-2 pb-2">
              <Checkbox
                id="is-electric"
                checked={isElectric}
                onCheckedChange={(checked) => setIsElectric(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="is-electric" className="cursor-pointer whitespace-nowrap">
                E-bike
              </Label>
            </div>
          </div>

          <BikeBrandModelFields
            brand={brand}
            model={model}
            onBrandChange={setBrand}
            onModelChange={setModel}
            onProductSelect={handleProductSelect}
          />

          <div className="space-y-2">
            <Label htmlFor="bike-description">Opisz swój rower</Label>
            <Textarea
              id="bike-description"
              placeholder="np. Mój główny rower do codziennych dojazdów, z dodatkowym oświetleniem i sakwami..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Twój opis będzie widoczny dla innych użytkowników. Pochwal się swoim setupem,
              opisz modyfikacje lub podziel się tym, co sprawia że ten rower jest wyjątkowy.
              Inni będą mogli komentować i proponować ulepszenia!
            </p>
          </div>
        </div>

        <DialogFooter className="shrink-0">
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

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
import { bikeTypeLabels } from "@/lib/types";
interface RenameBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: {
    id: string;
    brand?: string | null;
    model?: string | null;
    type: BikeType;
  };
  onSave: (data: {
    brand: string;
    model: string;
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
  const [type, setType] = useState<BikeType>(bike.type);

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await onSave({
        brand,
        model,
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
      setType(bike.type);
    }
    onOpenChange(open);
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

          <div className="space-y-2">
            <Label htmlFor="bike-brand">Marka</Label>
            <Input
              id="bike-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="np. Cannondale, Specialized, Trek"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bike-model">Model</Label>
            <Input
              id="bike-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="np. Topstone Carbon LTD Di2"
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

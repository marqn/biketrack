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
import { bikeTypeLabels } from "@/app/onboarding/OnboardingClient";

interface RenameBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: {
    name: string;
    brand?: string | null;
    model?: string | null;
    type?: BikeType | null;
  };
  onSave: (data: {
    name: string;
    brand: string;
    model: string;
    type: BikeType | "";
  }) => void | Promise<void>;
}

export function RenameBikeDialog({
  open,
  onOpenChange,
  bike,
  onSave,
}: RenameBikeDialogProps) {
  const [name, setName] = useState(bike.name);
  const [brand, setBrand] = useState(bike.brand ?? "");
  const [model, setModel] = useState(bike.model ?? "");
  const [type, setType] = useState<BikeType | "">(bike.type ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ name, brand, model, type });
      onOpenChange(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zmień nazwę roweru</DialogTitle>
          <DialogDescription>
            Nazwa jest wymagana. Marka i model są opcjonalne, ale pomagają w
            dopasowaniu komponentów.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="bike-name">Nazwa roweru</Label>
            <Input
              id="bike-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mój rower"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bike-type">Typ roweru (opcjonalnie)</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as BikeType)}
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
            <Label>Marka (opcjonalnie)</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Cannondale"
            />
          </div>

          <div className="space-y-2">
            <Label>Model (opcjonalnie)</Label>
            <Input
              value={model}
              onChange={(e) => setBikeModel(e.target.value)}
              placeholder="Topstone Carbon LTD Di2"
            />
            <p className="text-xs text-muted-foreground">
              Dzięki temu będziemy mogli zaproponować konkretne komponenty
              (np. korba, przerzutki, kaseta) dopasowane do tego modelu.
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
          <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
            {isLoading ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
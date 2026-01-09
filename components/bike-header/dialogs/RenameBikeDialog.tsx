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
import { useToast } from "@/hooks/use-toast";

interface RenameBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: {
    id: string;
    name: string | null;
    brand?: string | null;
    model?: string | null;
    type: BikeType; // ← Nie jest nullable
  };
  onSave: (data: {
    name: string;
    brand: string;
    model: string;
    type: BikeType; // ← Zawsze wymagane
  }) => Promise<{ success: boolean; error?: string }>;
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
  const [type, setType] = useState<BikeType>(bike.type); // ← Bez "NONE"

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name?.trim()) {
      toast({
        title: "Błąd",
        description: "Nazwa roweru jest wymagana",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await onSave({
        name,
        brand,
        model,
        type, // ← Już nie trzeba konwertować
      });

      if (result.success) {
        toast({
          title: "Sukces",
          description: "Rower został zaktualizowany",
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Błąd",
          description: result.error || "Nie udało się zaktualizować roweru",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset formularza gdy dialog się otwiera
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setName(bike.name);
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
            Nazwa i typ roweru są wymagane. Marka i model są opcjonalne, ale
            pomagają w dopasowaniu komponentów.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bike-name">
              Nazwa roweru <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bike-name"
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mój rower"
              disabled={isLoading}
            />
          </div>

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
          <Button onClick={handleSave} disabled={isLoading || !name?.trim()}>
            {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

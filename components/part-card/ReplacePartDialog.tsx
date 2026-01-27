"use client";

import { useState, useEffect } from "react";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReplacePartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partName: string;
  currentBrand?: string | null;
  currentModel?: string | null;
  onReplace: (data: { brand?: string; model?: string; notes?: string }) => Promise<void>;
}

export default function ReplacePartDialog({
  open,
  onOpenChange,
  partName,
  currentBrand,
  currentModel,
  onReplace,
}: ReplacePartDialogProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [notes, setNotes] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  // Reset form when dialog opens and populate with current values
  useEffect(() => {
    if (open) {
      setBrand(currentBrand || "");
      setModel(currentModel || "");
      setNotes("");
    }
  }, [open, currentBrand, currentModel]);

  const canSubmit = brand.trim().length > 0 && model.trim().length > 0;

  async function handleReplace() {
    if (!canSubmit) return;

    setIsReplacing(true);
    try {
      await onReplace({
        brand: brand.trim(),
        model: model.trim(),
        notes: notes.trim() || undefined,
      });
      // Reset form
      setBrand("");
      setModel("");
      setNotes("");
    } finally {
      setIsReplacing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wymień: {partName}</DialogTitle>
          <DialogDescription>
            Dodaj informacje o nowym komponencie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="brand">
              Marka <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brand"
              placeholder="np. Shimano, SRAM, KMC"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">
              Model <span className="text-destructive">*</span>
            </Label>
            <Input
              id="model"
              placeholder="np. XT CN-M8100, GX Eagle"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              placeholder="Opcjonalne notatki, np. sklep, cena, przyczyna wymiany..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleReplace} disabled={isReplacing || !canSubmit}>
            {isReplacing ? "Wymieniam..." : "Wymień komponent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
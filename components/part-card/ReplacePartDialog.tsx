"use client";

import * as React from "react";
import { useState } from "react";

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
  onReplace: (data: { brand?: string; model?: string; notes?: string }) => Promise<void>;
}

export default function ReplacePartDialog({
  open,
  onOpenChange,
  partName,
  onReplace,
}: ReplacePartDialogProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [notes, setNotes] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  async function handleReplace() {
    setIsReplacing(true);
    try {
      await onReplace({
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
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
            Dodaj informacje o nowym komponencie (opcjonalne)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Marka</Label>
            <Input
              id="brand"
              placeholder="np. Shimano, SRAM, KMC"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="np. XT CN-M8100, GX Eagle"
              value={model}
              onChange={(e) => setModel(e.target.value)}
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
          <Button onClick={handleReplace} disabled={isReplacing}>
            {isReplacing ? "Wymieniam..." : "Wymień komponent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
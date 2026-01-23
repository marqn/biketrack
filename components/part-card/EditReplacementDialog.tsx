"use client";

import * as React from "react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PartReplacement } from "@/lib/types";

interface EditReplacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replacement: PartReplacement;
  onSave: (data: { brand?: string; model?: string; notes?: string }) => Promise<void>;
}

export default function EditReplacementDialog({
  open,
  onOpenChange,
  replacement,
  onSave,
}: EditReplacementDialogProps) {
  const [brand, setBrand] = useState(replacement.brand || "");
  const [model, setModel] = useState(replacement.model || "");
  const [notes, setNotes] = useState(replacement.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave({
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edytuj wpis wymiany</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Marka</Label>
            <Input
              id="brand"
              placeholder="np. Shimano, SRAM"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="np. XT CN-M8100"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              placeholder="Opcjonalne notatki, np. przyczyna wymiany, obserwacje..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <div>
              Przebieg przy wymianie:{" "}
              <span className="font-medium">{replacement.kmAtReplacement} km</span>
            </div>
            <div>
              Przejechane przez komponent:{" "}
              <span className="font-medium">{replacement.kmUsed} km</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Zapisuję..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
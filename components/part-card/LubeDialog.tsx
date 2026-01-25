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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LubricantBrandAutocomplete from "./LubricantBrandAutocomplete";

interface LubeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKm: number;
  lastLubricantBrand?: string | null;
  lastLubricantName?: string | null;
  onLube: (data: { lubricantBrand?: string; notes?: string }) => Promise<void>;
}

export default function LubeDialog({
  open,
  onOpenChange,
  currentKm,
  lastLubricantBrand,
  lastLubricantName,
  onLube,
}: LubeDialogProps) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wypełnij pola poprzednimi wartościami po otwarciu
  React.useEffect(() => {
    if (open) {
      setBrand(lastLubricantBrand || "");
      setName(lastLubricantName || "");
      setNotes("");
    }
  }, [open, lastLubricantBrand, lastLubricantName]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await onLube({
        lubricantBrand: brand.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      // Reset form
      setBrand("");
      setName("");
      setNotes("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nasmaruj łańcuch</DialogTitle>
          <DialogDescription>
            Dodaj informacje o używanym smarze (opcjonalne)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm bg-muted p-3 rounded-md">
            Aktualny przebieg:{" "}
            <span className="font-medium">{currentKm} km</span>
          </div>

          <LubricantBrandAutocomplete
            id="brand"
            value={brand}
            onChange={setBrand}
          />

          <div className="space-y-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              placeholder="Opcjonalne notatki, np. warunki pogodowe, obserwacje..."
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Zapisuję..." : "Nasmaruj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
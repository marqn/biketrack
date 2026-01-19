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

interface LubeEvent {
  id: string;
  lubricantBrand: string | null;
  lubricantName: string | null;
  notes: string | null;
  kmAtTime: number;
}

interface EditLubeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lubeEvent: LubeEvent;
  onSave: (data: { lubricantBrand?: string; lubricantName?: string; notes?: string }) => Promise<void>;
}

export default function EditLubeDialog({
  open,
  onOpenChange,
  lubeEvent,
  onSave,
}: EditLubeDialogProps) {
  const [brand, setBrand] = useState(lubeEvent.lubricantBrand || "");
  const [name, setName] = useState(lubeEvent.lubricantName || "");
  const [notes, setNotes] = useState(lubeEvent.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave({
        lubricantBrand: brand.trim() || undefined,
        lubricantName: name.trim() || undefined,
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
          <DialogTitle>Edytuj wpis smarowania</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Marka smaru/wosku</Label>
            <Input
              id="brand"
              placeholder="np. Squirt, Muc-Off, Finish Line"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nazwa produktu</Label>
            <Input
              id="name"
              placeholder="np. Long Lasting Dry Lube, C3 Ceramic Wet"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            Przebieg przy smarowaniu:{" "}
            <span className="font-medium">{lubeEvent.kmAtTime} km</span>
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
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SealantProductAutocomplete from "./SealantProductAutocomplete";
import { SealantEvent, PartProduct } from "@/lib/types";

interface EditSealantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sealantEvent: SealantEvent;
  onSave: (data: {
    lubricantBrand?: string;
    lubricantProductId?: string | null;
    notes?: string;
    rating?: number;
    reviewText?: string;
  }) => Promise<void>;
}

export default function EditSealantDialog({
  open,
  onOpenChange,
  sealantEvent,
  onSave,
}: EditSealantDialogProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<PartProduct | null>(
    null
  );
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Wypełnij pola z sealantEvent
  React.useEffect(() => {
    if (open && sealantEvent) {
      if (sealantEvent.lubricantProduct) {
        setBrand(sealantEvent.lubricantProduct.brand);
        setModel(sealantEvent.lubricantProduct.model);
        setSelectedProduct(sealantEvent.lubricantProduct as unknown as PartProduct);
      } else if (sealantEvent.lubricantBrand) {
        setBrand(sealantEvent.lubricantBrand);
        setModel("");
        setSelectedProduct(null);
      } else {
        setBrand("");
        setModel("");
        setSelectedProduct(null);
      }

      const existingReview = sealantEvent.reviews?.[0];
      if (existingReview) {
        setRating(existingReview.rating);
        setReviewText(existingReview.reviewText || "");
      } else {
        setRating(0);
        setReviewText(sealantEvent.notes || "");
      }
    }
  }, [open, sealantEvent]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const lubricantBrand = selectedProduct
        ? `${brand} ${model}`.trim()
        : brand.trim() || undefined;

      await onSave({
        lubricantBrand,
        lubricantProductId: selectedProduct?.id || null,
        notes: reviewText.trim() || undefined,
        rating: rating > 0 ? rating : undefined,
        reviewText: reviewText.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj wpis wymiany mleka</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wybór produktu */}
          <SealantProductAutocomplete
            brand={brand}
            model={model}
            onBrandChange={setBrand}
            onModelChange={setModel}
            onProductSelect={(product) => {
              setSelectedProduct(product);
            }}
          />

          {/* Ocena gwiazdkowa */}
          <div className="space-y-2">
            <Label>Ocena (opcjonalnie)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-2xl transition-colors focus:outline-none"
                >
                  {star <= (hoveredRating || rating) ? (
                    <span className="text-yellow-500">★</span>
                  ) : (
                    <span className="text-muted-foreground">☆</span>
                  )}
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Wyczyść
                </button>
              )}
            </div>
          </div>

          {/* Opinia */}
          <div className="space-y-2">
            <Label htmlFor="sealant-edit-review">Opinia</Label>
            <Textarea
              id="sealant-edit-review"
              placeholder="Twoje wrażenia - jak się sprawdza, jak długo trzyma uszczelnienie..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
            />
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

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
import LubricantProductAutocomplete from "./LubricantProductAutocomplete";
import LubricantFields from "./specific-fields/LubricantFields";
import { LubeEvent, PartProduct } from "@/lib/types";
import { LubricantSpecificData } from "@/lib/part-specific-data";

interface EditLubeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lubeEvent: LubeEvent;
  onSave: (data: {
    lubricantBrand?: string;
    lubricantProductId?: string | null;
    notes?: string;
    rating?: number;
    reviewText?: string;
  }) => Promise<void>;
}

export default function EditLubeDialog({
  open,
  onOpenChange,
  lubeEvent,
  onSave,
}: EditLubeDialogProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<PartProduct | null>(
    null
  );
  const [lubricantData, setLubricantData] = useState<
    Partial<LubricantSpecificData>
  >({ lubricantType: "oil" });
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Wypełnij pola z lubeEvent
  React.useEffect(() => {
    if (open && lubeEvent) {
      if (lubeEvent.lubricantProduct) {
        setBrand(lubeEvent.lubricantProduct.brand);
        setModel(lubeEvent.lubricantProduct.model);
        setSelectedProduct(lubeEvent.lubricantProduct as unknown as PartProduct);
        const specs = lubeEvent.lubricantProduct
          .specifications as Partial<LubricantSpecificData> | null;
        if (specs?.lubricantType) {
          setLubricantData({ lubricantType: specs.lubricantType });
        }
      } else if (lubeEvent.lubricantBrand) {
        // Starsze wpisy bez powiązanego produktu
        setBrand(lubeEvent.lubricantBrand);
        setModel("");
        setSelectedProduct(null);
      } else {
        setBrand("");
        setModel("");
        setSelectedProduct(null);
      }

      // Wypełnij opinię z istniejącej recenzji
      const existingReview = lubeEvent.reviews?.[0];
      if (existingReview) {
        setRating(existingReview.rating);
        setReviewText(existingReview.reviewText || "");
      } else {
        setRating(0);
        setReviewText(lubeEvent.notes || "");
      }
    }
  }, [open, lubeEvent]);

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
          <DialogTitle>Edytuj wpis smarowania</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            Przebieg przy smarowaniu:{" "}
            <span className="font-medium">{lubeEvent.kmAtTime} km</span>
          </div>

          {/* Wybór produktu */}
          <LubricantProductAutocomplete
            brand={brand}
            model={model}
            onBrandChange={setBrand}
            onModelChange={setModel}
            onProductSelect={(product) => {
              setSelectedProduct(product);
              if (product?.specifications) {
                const specs =
                  product.specifications as Partial<LubricantSpecificData>;
                if (specs.lubricantType) {
                  setLubricantData({ lubricantType: specs.lubricantType });
                }
              }
            }}
          />

          {/* Typ smaru */}
          <LubricantFields data={lubricantData} onChange={setLubricantData} />

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
            <Label htmlFor="review">Opinia</Label>
            <Textarea
              id="review"
              placeholder="Twoje wrażenia - jak się sprawdza, jak długo utrzymuje się na łańcuchu..."
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

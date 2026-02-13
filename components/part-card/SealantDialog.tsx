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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SealantProductAutocomplete from "./SealantProductAutocomplete";
import { PartProduct } from "@/lib/types";
import { getUserSealantReview } from "@/app/app/actions/get-user-sealant-review";
import { Loader2 } from "lucide-react";

interface SealantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lastSealantProduct?: {
    id: string;
    brand: string;
    model: string;
    specifications: unknown;
  } | null;
  onChangeSealant: (data: {
    productId?: string;
    brand?: string;
    model?: string;
    unknownProduct?: boolean;
    rating?: number;
    reviewText?: string;
  }) => Promise<void>;
}

export default function SealantDialog({
  open,
  onOpenChange,
  lastSealantProduct,
  onChangeSealant,
}: SealantDialogProps) {
  const [unknownProduct, setUnknownProduct] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<PartProduct | null>(
    null,
  );
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  const showExtendedFields = brand.trim() !== "" && model.trim() !== "";

  // Wypełnij pola poprzednimi wartościami po otwarciu
  useEffect(() => {
    async function initDialog() {
      if (lastSealantProduct) {
        setBrand(lastSealantProduct.brand);
        setModel(lastSealantProduct.model);
        setSelectedProduct(lastSealantProduct as PartProduct);
        setUnknownProduct(false);

        if (lastSealantProduct.id) {
          setIsLoadingReview(true);
          try {
            const review = await getUserSealantReview(lastSealantProduct.id);
            if (review) {
              setRating(review.rating);
              setReviewText(review.reviewText || "");
            } else {
              setRating(0);
              setReviewText("");
            }
          } finally {
            setIsLoadingReview(false);
          }
        }
      } else {
        setBrand("");
        setModel("");
        setSelectedProduct(null);
        setUnknownProduct(false);
        setRating(0);
        setReviewText("");
      }
      setHoveredRating(0);
    }

    if (open) {
      initDialog();
    }
  }, [open, lastSealantProduct]);

  // Załaduj opinię po wybraniu nowego produktu
  useEffect(() => {
    async function loadPreviousReview() {
      if (!selectedProduct?.id) return;
      if (selectedProduct.id === lastSealantProduct?.id) return;

      setIsLoadingReview(true);
      try {
        const review = await getUserSealantReview(selectedProduct.id);
        if (review) {
          setRating(review.rating);
          setReviewText(review.reviewText || "");
        } else {
          setRating(0);
          setReviewText("");
        }
      } finally {
        setIsLoadingReview(false);
      }
    }

    if (selectedProduct?.id) {
      loadPreviousReview();
    }
  }, [selectedProduct?.id, lastSealantProduct?.id]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await onChangeSealant({
        productId: selectedProduct?.id,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        unknownProduct,
        rating: rating > 0 ? rating : undefined,
        reviewText: reviewText.trim() || undefined,
      });
      setBrand("");
      setModel("");
      setSelectedProduct(null);
      setRating(0);
      setReviewText("");
      setUnknownProduct(false);
    } finally {
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) {
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Zapisuję...
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Wymień mleko tubeless</DialogTitle>
          <DialogDescription>
            Dodaj informacje o używanym mleku i oceń je
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Checkbox "Nie znam produktu" */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="unknown-sealant"
              checked={unknownProduct}
              onCheckedChange={(checked) => {
                setUnknownProduct(checked === true);
                if (checked) {
                  setBrand("");
                  setModel("");
                  setSelectedProduct(null);
                  setRating(0);
                  setReviewText("");
                }
              }}
            />
            <Label
              htmlFor="unknown-sealant"
              className="text-sm font-normal cursor-pointer"
            >
              Nie znam produktu / Chcę tylko zapisać wymianę
            </Label>
          </div>

          {!unknownProduct && (
            <>
              <SealantProductAutocomplete
                brand={brand}
                model={model}
                onBrandChange={(newBrand) => {
                  setBrand(newBrand);
                  if (newBrand !== brand) {
                    setRating(0);
                    setReviewText("");
                  }
                }}
                onModelChange={(newModel) => {
                  setModel(newModel);
                  if (!selectedProduct) {
                    setRating(0);
                    setReviewText("");
                  }
                }}
                onProductSelect={(product) => {
                  setSelectedProduct(product);
                }}
              />

              {showExtendedFields && (
                <>
                  {/* Ocena gwiazdkowa */}
                  <div className="space-y-2">
                    <Label>
                      Ocena (opcjonalnie)
                      {isLoadingReview && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Ładowanie...
                        </span>
                      )}
                    </Label>
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
                    <Label htmlFor="sealant-review">Opinia (opcjonalnie)</Label>
                    <Textarea
                      id="sealant-review"
                      placeholder="Twoje wrażenia - jak się sprawdza, jak długo trzyma uszczelnienie..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Zapisuję..." : "Wymień mleko"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

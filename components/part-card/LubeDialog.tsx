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
import LubricantProductAutocomplete from "./LubricantProductAutocomplete";
import LubricantFields from "./specific-fields/LubricantFields";
import { PartProduct } from "@/lib/types";
import { LubricantSpecificData } from "@/lib/part-specific-data";
import { getUserLubricantReview } from "@/app/app/actions/get-user-lubricant-review";
import { Loader2 } from "lucide-react";

interface LubeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKm: number;
  lastLubricantProduct?: {
    id: string;
    brand: string;
    model: string;
    specifications: unknown;
  } | null;
  onLube: (data: {
    productId?: string;
    brand?: string;
    model?: string;
    lubricantType?: "wax" | "oil";
    unknownProduct?: boolean;
    rating?: number;
    reviewText?: string;
  }) => Promise<void>;
}

export default function LubeDialog({
  open,
  onOpenChange,
  currentKm,
  lastLubricantProduct,
  onLube,
}: LubeDialogProps) {
  const [unknownProduct, setUnknownProduct] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<PartProduct | null>(
    null,
  );
  const [lubricantData, setLubricantData] = useState<
    Partial<LubricantSpecificData>
  >({ lubricantType: "oil" });
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  // Czy pokazać dodatkowe pola (typ, ocena, opinia)
  const showExtendedFields = brand.trim() !== "" && model.trim() !== "";

  // Wypełnij pola poprzednimi wartościami po otwarciu
  useEffect(() => {
    if (open) {
      if (lastLubricantProduct) {
        setBrand(lastLubricantProduct.brand);
        setModel(lastLubricantProduct.model);
        setSelectedProduct(lastLubricantProduct as PartProduct);
        const specs =
          lastLubricantProduct.specifications as Partial<LubricantSpecificData> | null;
        if (specs?.lubricantType) {
          setLubricantData({ lubricantType: specs.lubricantType });
        }
        setUnknownProduct(false);
      } else {
        setBrand("");
        setModel("");
        setSelectedProduct(null);
        setLubricantData({ lubricantType: "oil" });
        setUnknownProduct(false);
      }
      setRating(0);
      setHoveredRating(0);
      setReviewText("");
    }
  }, [open, lastLubricantProduct]);

  // Załaduj poprzednią opinię użytkownika po wybraniu produktu
  useEffect(() => {
    async function loadPreviousReview() {
      if (!selectedProduct?.id) return;

      setIsLoadingReview(true);
      try {
        const review = await getUserLubricantReview(selectedProduct.id);
        if (review) {
          setRating(review.rating);
          setReviewText(review.reviewText || "");
        }
      } finally {
        setIsLoadingReview(false);
      }
    }

    if (selectedProduct?.id) {
      loadPreviousReview();
    }
  }, [selectedProduct?.id]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await onLube({
        productId: selectedProduct?.id,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        lubricantType: lubricantData.lubricantType,
        unknownProduct,
        rating: rating > 0 ? rating : undefined,
        reviewText: reviewText.trim() || undefined,
      });
      // Reset form
      setBrand("");
      setModel("");
      setSelectedProduct(null);
      setLubricantData({ lubricantType: "oil" });
      setRating(0);
      setReviewText("");
      setUnknownProduct(false);
    } finally {
      setTimeout(() => setIsSubmitting(false), 1000); // Małe opóźnienie dla lepszego UX
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
          <DialogTitle>Nasmaruj łańcuch</DialogTitle>
          <DialogDescription>
            Dodaj informacje o używanym smarze i oceń go
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm bg-muted p-3 rounded-md">
            Aktualny przebieg:{" "}
            <span className="font-medium">{currentKm} km</span>
          </div>

          {/* Checkbox "Nie znam produktu" */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="unknown-product"
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
              htmlFor="unknown-product"
              className="text-sm font-normal cursor-pointer"
            >
              Nie znam produktu / Chcę tylko zapisać smarowanie
            </Label>
          </div>

          {!unknownProduct && (
            <>
              {/* Wybór produktu - zawsze widoczny */}
              <LubricantProductAutocomplete
                brand={brand}
                model={model}
                onBrandChange={(newBrand) => {
                  setBrand(newBrand);
                  // Reset opinii przy zmianie marki
                  if (newBrand !== brand) {
                    setRating(0);
                    setReviewText("");
                  }
                }}
                onModelChange={(newModel) => {
                  setModel(newModel);
                  // Reset opinii przy zmianie modelu (jeśli nie z autocomplete)
                  if (!selectedProduct) {
                    setRating(0);
                    setReviewText("");
                  }
                }}
                onProductSelect={(product) => {
                  setSelectedProduct(product);
                  if (product?.specifications) {
                    const specs =
                      product.specifications as Partial<LubricantSpecificData>;
                    if (specs.lubricantType) {
                      setLubricantData({ lubricantType: specs.lubricantType });
                    }
                  }
                  // Opinia zostanie załadowana przez useEffect
                }}
              />

              {/* Dodatkowe pola - widoczne po wypełnieniu marki i modelu */}
              {showExtendedFields && (
                <>
                  {/* Typ smaru */}
                  <LubricantFields
                    data={lubricantData}
                    onChange={setLubricantData}
                  />

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
                    <Label htmlFor="review">Opinia (opcjonalnie)</Label>
                    <Textarea
                      id="review"
                      placeholder="Twoje wrażenia - jak się sprawdza, jak długo utrzymuje się na łańcuchu..."
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
            {isSubmitting ? "Zapisuję..." : "Nasmaruj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PartType } from "@/lib/generated/prisma";
import { PartProduct, BikePartWithProduct } from "@/lib/types";
import { installPart } from "@/app/app/actions/install-part";
import BrandModelFields from "./BrandModelFields";
import TireFields from "./specific-fields/TireFields";
import ChainFields from "./specific-fields/ChainFields";
import CassetteFields from "./specific-fields/CassetteFields";
import PadsFields from "./specific-fields/PadsFields";
import {
  getDefaultSpecificData,
  hasSpecificFields,
  TireSpecificData,
  ChainSpecificData,
  CassetteSpecificData,
  PadsSpecificData,
} from "@/lib/part-specific-data";

interface PartDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partType: PartType;
  partName: string;
  partId: string;
  bikeId: string;
  mode: "create" | "edit" | "replace";
  currentPart?: Partial<BikePartWithProduct> | null;
}

export default function PartDetailsDialog({
  open,
  onOpenChange,
  partType,
  partName,
  partId,
  bikeId,
  mode,
  currentPart,
}: PartDetailsDialogProps) {
  const [selectedProduct, setSelectedProduct] = useState<PartProduct | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [installedAt, setInstalledAt] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [partSpecificData, setPartSpecificData] = useState<Record<string, unknown>>(
    getDefaultSpecificData(partType) as Record<string, unknown>
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      if (mode === "edit" && currentPart?.product) {
        // Tryb edycji - załaduj dane z currentPart
        setSelectedProduct(currentPart.product as PartProduct);
        setBrand(currentPart.product.brand);
        setModel(currentPart.product.model);

        if (currentPart.installedAt) {
          const date = new Date(currentPart.installedAt);
          setInstalledAt(date.toISOString().split("T")[0]);
        } else {
          const today = new Date();
          setInstalledAt(today.toISOString().split("T")[0]);
        }

        if (currentPart.partSpecificData) {
          setPartSpecificData(currentPart.partSpecificData as Record<string, unknown>);
        } else {
          setPartSpecificData(getDefaultSpecificData(partType) as Record<string, unknown>);
        }

        // Załaduj ocenę i opinię jeśli istnieją
        if (currentPart.product.reviews && currentPart.product.reviews.length > 0) {
          const review = currentPart.product.reviews[0];
          setRating(review.rating || 0);
          setReviewText(review.text || "");
        } else {
          setRating(0);
          setReviewText("");
        }
      } else {
        // Tryb create i replace - wyczyść wszystko
        setSelectedProduct(null);
        setBrand("");
        setModel("");
        const today = new Date();
        setInstalledAt(today.toISOString().split("T")[0]);
        setPartSpecificData(getDefaultSpecificData(partType) as Record<string, unknown>);
        setRating(0);
        setReviewText("");
      }
    }
  }, [open, mode, currentPart, partType]);

  async function handleSave() {
    if (!brand.trim() || !model.trim()) {
      alert("Proszę podać markę i model");
      return;
    }

    startTransition(async () => {
      try {
        await installPart({
          partId,
          productId: selectedProduct?.id,
          brand: brand.trim(),
          model: model.trim(),
          installedAt: installedAt ? new Date(installedAt) : undefined,
          partSpecificData: hasSpecificFields(partType) ? partSpecificData : undefined,
          rating: rating > 0 ? rating : undefined,
          reviewText: reviewText.trim() || undefined,
          isReplacement: mode === "replace",
        });
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("Error saving part:", error);
        alert("Wystąpił błąd podczas zapisywania");
      }
    });
  }

  function renderSpecificFields() {
    if (!hasSpecificFields(partType)) return null;

    switch (partType) {
      case PartType.TIRE_FRONT:
      case PartType.TIRE_REAR:
        return (
          <TireFields
            data={partSpecificData as Partial<TireSpecificData>}
            onChange={(data) => setPartSpecificData(data as Record<string, unknown>)}
          />
        );
      case PartType.CHAIN:
        return (
          <ChainFields
            data={partSpecificData as Partial<ChainSpecificData>}
            onChange={(data) => setPartSpecificData(data as Record<string, unknown>)}
          />
        );
      case PartType.CASSETTE:
        return (
          <CassetteFields
            data={partSpecificData as Partial<CassetteSpecificData>}
            onChange={(data) => setPartSpecificData(data as Record<string, unknown>)}
          />
        );
      case PartType.PADS_FRONT:
      case PartType.PADS_REAR:
        return (
          <PadsFields
            data={partSpecificData as Partial<PadsSpecificData>}
            onChange={(data) => setPartSpecificData(data as Record<string, unknown>)}
          />
        );
      default:
        return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {mode === "edit"
              ? "Edytuj szczegóły"
              : mode === "replace"
              ? "Wymień"
              : "Dodaj szczegóły"}: {partName}
          </DialogTitle>
          <DialogDescription>
            {mode === "replace"
              ? "Podaj szczegóły nowej części"
              : "Określ model części oraz jej parametry użytkowe"}
          </DialogDescription>
        </DialogHeader>

        <div
          className="custom-scrollbar space-y-6 overflow-y-auto -mx-6 pl-6 pr-8"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {/* === Podstawowe informacje === */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Podstawowe informacje</h4>

            <BrandModelFields
              partType={partType}
              brand={brand}
              model={model}
              onBrandChange={(newBrand) => setBrand(newBrand)}
              onModelChange={(newModel) => setModel(newModel)}
              onProductSelect={(product) => {
                setSelectedProduct(product);
                if (product && product.specifications) {
                  setPartSpecificData(
                    product.specifications as Record<string, unknown>
                  );
                }
              }}
            />
          </div>

          {/* === Data montażu === */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Data montażu</h4>
            <Input
              type="date"
              value={installedAt}
              onChange={(e) => setInstalledAt(e.target.value)}
            />
          </div>

          {/* === Specyficzne pola dla typu części === */}
          {renderSpecificFields()}

          {/* === Opinia === */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Opinia (opcjonalnie)</h4>

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
            </div>

            <Textarea
              placeholder="Twoje wrażenia, trwałość, awaryjność…"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Zapisuję..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
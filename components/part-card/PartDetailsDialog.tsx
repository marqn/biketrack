"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PartType } from "@/lib/generated/prisma";
import { PartProduct, BikePartWithProduct } from "@/lib/types";
import { installPart } from "@/app/app/actions/install-part";
import { getUserPartReview } from "@/app/app/actions/get-user-part-review";
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
  mode: "create" | "edit" | "replace";
  currentPart?: Partial<BikePartWithProduct> | null;
  // Opcjonalne - dla edycji PartReplacement z historii
  onSave?: (data: { brand?: string; model?: string; notes?: string }) => Promise<void>;
  initialBrand?: string;
  initialModel?: string;
  initialNotes?: string;
}

export default function PartDetailsDialog({
  open,
  onOpenChange,
  partType,
  partName,
  partId,
  mode,
  currentPart,
  onSave,
  initialBrand,
  initialModel,
  initialNotes,
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
  const [unknownProduct, setUnknownProduct] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function initDialog() {
      if (mode === "edit" && currentPart?.product) {
        // Tryb edycji - załaduj dane z currentPart
        setSelectedProduct(currentPart.product as PartProduct);
        setBrand(currentPart.product.brand);
        setModel(currentPart.product.model);
        setUnknownProduct(false);

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

        // Załaduj opinię użytkownika z bazy danych
        if (currentPart.product.id) {
          setIsLoadingReview(true);
          try {
            const review = await getUserPartReview(currentPart.product.id);
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
        } else {
          setRating(0);
          setReviewText("");
        }
      } else if (mode === "edit" && isSealant && currentPart?.installedAt) {
        // Tryb edycji mleka tubeless bez produktu (tylko data)
        setSelectedProduct(null);
        setBrand("");
        setModel("");
        setUnknownProduct(true);
        const date = new Date(currentPart.installedAt);
        setInstalledAt(date.toISOString().split("T")[0]);
        setPartSpecificData(getDefaultSpecificData(partType) as Record<string, unknown>);
        setRating(0);
        setReviewText("");
      } else if (initialBrand || initialModel) {
        // Tryb edycji z initial values (np. z PartReplacement)
        setSelectedProduct(null);
        setBrand(initialBrand || "");
        setModel(initialModel || "");
        setUnknownProduct(false);
        const today = new Date();
        setInstalledAt(today.toISOString().split("T")[0]);
        setPartSpecificData(getDefaultSpecificData(partType) as Record<string, unknown>);
        setRating(0);
        setReviewText(initialNotes || "");
      } else {
        // Tryb create i replace - wyczyść wszystko
        setSelectedProduct(null);
        setBrand("");
        setModel("");
        setUnknownProduct(false);
        const today = new Date();
        setInstalledAt(today.toISOString().split("T")[0]);
        setPartSpecificData(getDefaultSpecificData(partType) as Record<string, unknown>);
        setRating(0);
        setReviewText("");
      }
      setHoveredRating(0);
    }

    if (open) {
      initDialog();
    }
  }, [open, mode, currentPart, partType, initialBrand, initialModel, initialNotes]);

  const isSealant = partType === PartType.TUBELESS_SEALANT;

  async function handleSave() {
    if (!unknownProduct && (!brand.trim() || !model.trim())) {
      alert("Proszę podać markę i model");
      return;
    }

    startTransition(async () => {
      try {
        if (onSave) {
          // Użyj zewnętrznego handlera (np. dla edycji PartReplacement)
          await onSave({
            brand: brand.trim(),
            model: model.trim(),
            notes: reviewText.trim() || undefined,
          });
        } else {
          await installPart({
            partId,
            productId: selectedProduct?.id,
            brand: brand.trim(),
            model: model.trim(),
            installedAt: installedAt ? new Date(installedAt) : undefined,
            partSpecificData: hasSpecificFields(partType) ? partSpecificData : undefined,
            rating: rating > 0 ? rating : undefined,
            reviewText: reviewText.trim() || undefined,
            mode,
          });
        }
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
        <DialogHeader className="shrink-0">
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

            {isSealant && (
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
                  Nie znam produktu / Chcę tylko zapisać datę
                </Label>
              </div>
            )}

            {!unknownProduct && (
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
            )}
          </div>

          {/* === Data montażu === */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Data montażu</h4>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !installedAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {installedAt
                    ? format(new Date(installedAt), "d MMMM yyyy", { locale: pl })
                    : "Wybierz datę"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={installedAt ? new Date(installedAt) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setInstalledAt(date.toISOString().split("T")[0]);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  locale={pl}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* === Specyficzne pola dla typu części === */}
          {renderSpecificFields()}

          {/* === Opinia === */}
          {!unknownProduct && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">
                Opinia (opcjonalnie)
                {isLoadingReview && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    Ładowanie...
                  </span>
                )}
              </h4>

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
          )}
        </div>

        <DialogFooter className="shrink-0">
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
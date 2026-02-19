"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BikeType } from "@/lib/generated/prisma";
import { bikeTypeLabels } from "@/lib/types";
import { addProductReview } from "@/app/actions/add-product-review";
import { upload } from "@vercel/blob/client";
import {
  compressImage,
  IMAGE_ALLOWED_TYPES,
  IMAGE_MAX_SIZE,
} from "@/lib/image-compression";
import { Plus, X, Loader2 } from "lucide-react";

const MAX_IMAGES = 3;

interface ExistingReview {
  id: string;
  rating: number;
  reviewText: string | null;
  pros: string[];
  cons: string[];
  bikeType: BikeType;
  images: string[];
}

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  existingReview: ExistingReview | null;
}

export function AddReviewDialog({
  open,
  onOpenChange,
  productId,
  existingReview,
}: AddReviewDialogProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState(
    existingReview?.reviewText || ""
  );
  const [bikeType, setBikeType] = useState<BikeType>(
    existingReview?.bikeType || BikeType.ROAD
  );
  const [images, setImages] = useState<string[]>(
    existingReview?.images || []
  );
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (existingReview) {
        setRating(existingReview.rating);
        setReviewText(existingReview.reviewText || "");
        setBikeType(existingReview.bikeType);
        setImages(existingReview.images || []);
      } else {
        setRating(0);
        setReviewText("");
        setBikeType(BikeType.ROAD);
        setImages([]);
      }
      setError(null);
      setImageError(null);
    }
  }, [open, existingReview]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setImageError("Dozwolone formaty: JPG, PNG, WebP");
      return;
    }
    if (file.size > IMAGE_MAX_SIZE) {
      setImageError("Maksymalny rozmiar: 10MB");
      return;
    }

    setImageError(null);
    setUploading(true);

    try {
      const compressedFile = await compressImage(file, "review");

      const blob = await upload(compressedFile.name, compressedFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ type: "review", entityId: productId }),
      });

      setImages((prev) => [...prev, blob.url]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Błąd podczas uploadu";
      setImageError(message);
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function handleSubmit() {
    if (rating === 0) {
      setError("Prosze wybrac ocene");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await addProductReview({
          productId,
          rating,
          reviewText: reviewText.trim() || undefined,
          bikeType,
          images,
        });
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Wystapil blad");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Edytuj opinie" : "Dodaj opinie"}
          </DialogTitle>
          <DialogDescription>
            Podziel sie swoimi doswiadczeniami z tym produktem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">

          {/* Images */}
          <div className="space-y-2">
            <Label>Zdjęcie</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div
                  key={url}
                  className="relative w-20 h-20 rounded-lg border overflow-hidden bg-muted/50 group"
                >
                  <img
                    src={url}
                    alt="Zdjęcie recenzji"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    disabled={isPending}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-background/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors bg-muted/50">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span className="text-[10px]">Dodaj</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading || isPending}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {images.length}/{MAX_IMAGES} zdjęć (JPG/PNG/WebP)
            </p>
            {imageError && (
              <p className="text-xs text-destructive">{imageError}</p>
            )}
          </div>
          
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Ocena *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-3xl transition-colors focus:outline-none"
                >
                  {star <= (hoveredRating || rating) ? (
                    <span className="text-yellow-500">★</span>
                  ) : (
                    <span className="text-muted-foreground">☆</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bike Type */}
          <div className="space-y-2">
            <Label>Typ roweru</Label>
            <Select
              value={bikeType}
              onValueChange={(v) => setBikeType(v as BikeType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(bikeTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label>Opinia (opcjonalnie)</Label>
            <Textarea
              placeholder="Twoje wrazenia, trwalosc, jak sie sprawdza..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
          </div>

          

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || rating === 0 || uploading}>
            {isPending ? "Zapisuje..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

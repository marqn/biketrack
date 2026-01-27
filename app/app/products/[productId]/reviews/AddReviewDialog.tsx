"use client";

import { useState, useTransition, useEffect } from "react";
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
import { addProductReview } from "@/app/app/actions/add-product-review";

interface ExistingReview {
  id: string;
  rating: number;
  reviewText: string | null;
  pros: string[];
  cons: string[];
  bikeType: BikeType;
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      if (existingReview) {
        setRating(existingReview.rating);
        setReviewText(existingReview.reviewText || "");
        setBikeType(existingReview.bikeType);
      } else {
        setRating(0);
        setReviewText("");
        setBikeType(BikeType.ROAD);
      }
      setError(null);
    }
  }, [open, existingReview]);

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
          <Button onClick={handleSubmit} disabled={isPending || rating === 0}>
            {isPending ? "Zapisuje..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

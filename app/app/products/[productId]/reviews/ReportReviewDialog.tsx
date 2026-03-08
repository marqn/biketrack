"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { reportReview } from "@/app/app/actions/report-review";

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "OFFENSIVE", label: "Obraźliwa" },
  { value: "IRRELEVANT", label: "Nieistotna" },
  { value: "OTHER", label: "Inny powód" },
] as const;

interface ReportReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
}

export function ReportReviewDialog({ open, onOpenChange, reviewId }: ReportReviewDialogProps) {
  const [reason, setReason] = useState<string>("SPAM");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await reportReview({
      reviewId,
      reason,
      details: details.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      onOpenChange(false);
      setReason("SPAM");
      setDetails("");
    } else {
      setError(result.error ?? "Wystąpił błąd");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zgłoś opinię</DialogTitle>
          <DialogDescription>
            Wybierz powód zgłoszenia. Moderator rozpatrzy zgłoszenie.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((r) => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                <Label htmlFor={`reason-${r.value}`} className="cursor-pointer">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {reason === "OTHER" && (
            <Textarea
              placeholder="Opisz powód zgłoszenia..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={2}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Wysyłanie..." : "Zgłoś"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

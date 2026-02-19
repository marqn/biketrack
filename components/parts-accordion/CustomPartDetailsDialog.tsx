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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { updateCustomPart } from "@/app/actions/custom-part";

interface CustomPartDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partId: string;
  partName: string;
  currentBrand?: string | null;
  currentModel?: string | null;
  currentInstalledAt?: Date | string | null;
}

export default function CustomPartDetailsDialog({
  open,
  onOpenChange,
  partId,
  partName,
  currentBrand,
  currentModel,
  currentInstalledAt,
}: CustomPartDetailsDialogProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [installedAt, setInstalledAt] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setBrand(currentBrand || "");
      setModel(currentModel || "");
      if (currentInstalledAt) {
        const date = new Date(currentInstalledAt);
        setInstalledAt(format(date, "yyyy-MM-dd"));
      } else {
        setInstalledAt(format(new Date(), "yyyy-MM-dd"));
      }
    }
  }, [open, currentBrand, currentModel, currentInstalledAt]);

  function handleSave() {
    startTransition(async () => {
      try {
        await updateCustomPart(partId, {
          brand: brand.trim() || undefined,
          model: model.trim() || undefined,
          installedAt: installedAt ? new Date(installedAt) : undefined,
        });
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("Error updating custom part:", error);
        alert("Wystąpił błąd podczas zapisywania");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Szczegóły: {partName}</DialogTitle>
          <DialogDescription>
            Marka i model są opcjonalne
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-brand">Marka</Label>
            <Input
              id="custom-brand"
              placeholder="np. Shimano, SRAM..."
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-model">Model</Label>
            <Input
              id="custom-model"
              placeholder="np. Dura-Ace, XX Eagle..."
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Data montażu</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !installedAt && "text-muted-foreground",
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
                      setInstalledAt(format(date, "yyyy-MM-dd"));
                    }
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date > new Date()}
                  locale={pl}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
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

"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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
import NumberStepper from "@/components/ui/number-stepper";
import { createCustomPart } from "@/app/actions/custom-part";

interface AddCustomPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bikeId: string;
  category: string;
}

export default function AddCustomPartDialog({
  open,
  onOpenChange,
  bikeId,
  category,
}: AddCustomPartDialogProps) {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [expectedKm, setExpectedKm] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        const km = expectedKm > 0 ? expectedKm : undefined;
        await createCustomPart(bikeId, name.trim(), category, km);
        setName("");
        setExpectedKm(0);
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("Error creating custom part:", error);
        alert(t("parts.errorCreatingPart"));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("parts.addCustomPart")}</DialogTitle>
          <DialogDescription>
            {t("partsOrder.enterPartDetails")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-part-name">{t("parts.customPartName")}</Label>
            <Input
              id="custom-part-name"
              placeholder={t("parts.customPartPlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-part-km">
              {t("parts.kmLimit")} <span className="text-muted-foreground font-normal">({t("common.optional")})</span>
            </Label>
            <NumberStepper
              value={expectedKm}
              onChange={setExpectedKm}
              steps={[10,100]}
              min={0}
              placeholder="np. 5000"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <p className="text-xs text-muted-foreground">
              Dystans po którym część się zużyje
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isPending || !name.trim()}>
            {isPending ? "Dodaję..." : "Dodaj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

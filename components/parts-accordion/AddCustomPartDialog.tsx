"use client";

import { useState, useTransition } from "react";
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
import { createCustomPart } from "@/app/app/actions/custom-part";
import { useSession } from "next-auth/react";
import { inputToKm, distanceUnit } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";

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
  const [name, setName] = useState("");
  const [expectedKm, setExpectedKm] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session } = useSession();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";

  function handleSave() {
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        // Konwertuj do km jeśli user wpisuje w milach
        const kmMetric = expectedKm > 0 ? inputToKm(expectedKm, unitPref) : undefined;
        await createCustomPart(bikeId, name.trim(), category, kmMetric);
        setName("");
        setExpectedKm(0);
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("Error creating custom part:", error);
        alert("Wystąpił błąd podczas tworzenia części");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj własną część</DialogTitle>
          <DialogDescription>
            Podaj nazwę części i opcjonalnie limit km
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-part-name">Nazwa części</Label>
            <Input
              id="custom-part-name"
              placeholder="np. Pancerz, Osłona łańcucha..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-part-km">
              Limit {distanceUnit(unitPref)} <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
            </Label>
            <NumberStepper
              value={expectedKm}
              onChange={setExpectedKm}
              steps={[10,100]}
              min={0}
              placeholder={unitPref === "IMPERIAL" ? "np. 3000" : "np. 5000"}
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

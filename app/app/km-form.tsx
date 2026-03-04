"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { updateBikeKm } from "./actions/update-bike-km";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import NumberStepper from "@/components/ui/number-stepper";
import { useSession } from "next-auth/react";
import { displayKm, inputToKm, distanceUnit, distanceRange } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";
import { Pencil } from "lucide-react";

type Props = {
  bikeId: string;
  initialKm: number;
  hasStravaSync?: boolean;
};

export default function KmForm({ bikeId, initialKm, hasStravaSync }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";

  // optimisticKm i inputKm zawsze w METRYCZNYCH (km) — konwersja tylko do wyświetlania
  const [optimisticKm, setOptimisticKm] = useOptimistic(
    initialKm,
    (_, newKm: number) => newKm,
  );

  const [inputKm, setInputKm] = useState(displayKm(optimisticKm, unitPref));

  // Synchronizuj inputKm gdy zmieni się rower lub jednostki
  useEffect(() => {
    setInputKm(displayKm(initialKm, unitPref));
  }, [initialKm, unitPref]);

  async function action(formData: FormData) {
    // Wartość z formularza jest w jednostkach użytkownika — konwertuj do km
    const displayValue = Number(formData.get("newKm"));
    const newKmMetric = inputToKm(displayValue, unitPref);

    if (newKmMetric === optimisticKm) return;

    formData.set("newKm", newKmMetric.toString());

    const prevKm = optimisticKm;

    startTransition(() => {
      setOptimisticKm(newKmMetric);
    });

    await updateBikeKm(formData);

    const unit = distanceUnit(unitPref);
    toast.success(`Zapisano przebieg: ${displayKm(newKmMetric, unitPref)} ${unit}`, {
      description:
        prevKm !== newKmMetric
          ? `Zmiana: ${displayKm(prevKm, unitPref)} → ${displayKm(newKmMetric, unitPref)} ${unit}`
          : undefined,
    });

    setOpen(false);
  }

  const unit = distanceUnit(unitPref);
  const range = distanceRange(unitPref);
  const hasChanged = inputToKm(inputKm, unitPref) !== optimisticKm;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex justify-between items-center px-3 py-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left">
          <span className="text-sm font-medium">
            🚲 Przebieg: {displayKm(optimisticKm, unitPref)} {unit}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Pencil size={12} />
            {open ? "Ukryj" : "Edytuj ręcznie"}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <form action={action} className="flex flex-col gap-3 p-3 pt-2 border border-t-0 rounded-b-lg bg-card">
          <input type="hidden" name="bikeId" value={bikeId} />
          <NumberStepper
            incrementOnly
            name="newKm"
            value={inputKm}
            onChange={setInputKm}
            steps={[1, 10]}
            min={range.min}
            max={range.max}
            disabled={isPending}
          />
          <Button disabled={isPending || !hasChanged} variant={hasChanged ? "default" : "outline"}>
            {isPending ? "Zapisuję..." : "💾 Zapisz"}
          </Button>
          {hasStravaSync && (
            <p className="text-xs text-muted-foreground text-center">
              Przebieg aktualizuje się automatycznie z Strava
            </p>
          )}
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}

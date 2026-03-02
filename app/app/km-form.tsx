"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { updateBikeKm } from "./actions/update-bike-km";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NumberStepper from "@/components/ui/number-stepper";
import { useSession } from "next-auth/react";
import { displayKm, inputToKm, distanceUnit, distanceRange } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";

type Props = {
  bikeId: string;
  initialKm: number;
};

export default function KmForm({ bikeId, initialKm }: Props) {
  const [isPending, startTransition] = useTransition();
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
  }

  const unit = distanceUnit(unitPref);
  const range = distanceRange(unitPref);
  const hasChanged = inputToKm(inputKm, unitPref) !== optimisticKm;

  return (
    <Card className="mt-4 mx-auto max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-center">
          🚲 Aktualny przebieg roweru
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form action={action} className="flex flex-col gap-3 p-6 pt-0">
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
          <span className="text-center">
            Aktualnie zapisane: {displayKm(optimisticKm, unitPref)} {unit}
          </span>
        </form>
      </CardContent>
    </Card>
  );
}

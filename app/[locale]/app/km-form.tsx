"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { updateBikeKm } from "@/app/actions/update-bike-km";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NumberStepper from "@/components/ui/number-stepper";

type Props = {
  bikeId: string;
  initialKm: number;
};

export default function KmForm({ bikeId, initialKm }: Props) {
  const [isPending, startTransition] = useTransition();

  const [optimisticKm, setOptimisticKm] = useOptimistic(
    initialKm,
    (_, newKm: number) => newKm,
  );

  const [inputKm, setInputKm] = useState(optimisticKm);

  // Synchronizuj inputKm gdy zmieni się rower (nowe initialKm)
  useEffect(() => {
    setInputKm(initialKm);
  }, [initialKm]);

  async function action(formData: FormData) {
    const newKm = Number(formData.get("newKm"));
    const prevKm = optimisticKm;

    startTransition(() => {
      setOptimisticKm(newKm);
    });

    await updateBikeKm(formData);

    toast.success(`Zapisano przebieg: ${newKm.toLocaleString("pl-PL")} km`, {
      description:
        prevKm !== newKm
          ? `Zmiana: ${prevKm.toLocaleString("pl-PL")} km → ${newKm.toLocaleString("pl-PL")} km`
          : undefined,
    });
  }

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
            min={0}
            disabled={isPending}
          />
          <Button disabled={isPending} variant="outline">
            {isPending ? "Zapisuję..." : "💾 Zapisz km"}
          </Button>
          <span className="text-center">
            Aktualnie zapisane: {optimisticKm} km
          </span>
        </form>
      </CardContent>
    </Card>
  );
}

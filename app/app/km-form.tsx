"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateBikeKm } from "./actions/update-bike-km";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  bikeId: string;
  initialKm: number;
};

export default function KmForm({ bikeId, initialKm }: Props) {
  const [isPending, startTransition] = useTransition();

  const [optimisticKm, setOptimisticKm] = useOptimistic(
    initialKm,
    (_, newKm: number) => newKm
  );

  const [inputKm, setInputKm] = useState(optimisticKm);

  async function action(formData: FormData) {
    const newKm = Number(formData.get("newKm"));

    startTransition(() => {
      setOptimisticKm(newKm);
    });

    await updateBikeKm(formData);
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          🚲 Aktualny przebieg roweru
        </CardTitle>
      </CardHeader>

      <form action={action} className="flex flex-col gap-3 p-6 pt-0">
        <input type="hidden" name="bikeId" value={bikeId} />

        <div className="flex items-center gap-2">
          <Input
            type="number"
            name="newKm"
            value={inputKm}
            onChange={(e) => setInputKm(Number(e.target.value))}
            disabled={isPending}
            className="flex-1"
          />

          <Button disabled={isPending} size="sm">
            {isPending ? "Zapisuję..." : "💾 Zapisz km"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Aktualnie zapisane: {optimisticKm} km
        </p>
      </form>
    </Card>
  );
}
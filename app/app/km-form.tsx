"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateBikeKm } from "./actions/update-bike-km";

type Props = {
  bikeId: string;
  initialKm: number;
};

export default function KmForm({ bikeId, initialKm }: Props) {
  const [isPending, startTransition] = useTransition();

  // optimistic = to co pokazujemy PO zapisie
  const [optimisticKm, setOptimisticKm] = useOptimistic(
    initialKm,
    (_, newKm: number) => newKm
  );

  // local state = input
  const [inputKm, setInputKm] = useState(optimisticKm);

  async function action(formData: FormData) {
    const newKm = Number(formData.get("newKm"));

    startTransition(() => {
      setOptimisticKm(newKm);
    });

    await updateBikeKm(formData);
  }

  return (
    <form action={action}>
      <input type="hidden" name="bikeId" value={bikeId} />

      <input
        type="number"
        name="newKm"
        value={inputKm}
        onChange={(e) => setInputKm(Number(e.target.value))}
        disabled={isPending}
      />

      <button disabled={isPending}>Zapisz km</button>

      <p style={{ opacity: 0.6 }}>
        Aktualnie zapisane: {optimisticKm} km
      </p>
    </form>
  );
}

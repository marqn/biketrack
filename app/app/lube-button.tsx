"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addChainLube } from "./actions/add-chain-lube";

export default function LubeButton({
  bikeId,
  currentKm,
  lastLubeKmInitial,
}: {
  bikeId: string;
  currentKm: number;
  lastLubeKmInitial?: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [lastLubeKm, setLastLubeKm] = useOptimistic<number | null>(
    lastLubeKmInitial ?? null,
    (_, km) => km
  );

  const kmSinceLube = lastLubeKm !== null ? currentKm - lastLubeKm : currentKm;

  async function action() {
    startTransition(async () => {
      setLastLubeKm(currentKm); // tylko UI
      await addChainLube(bikeId); // server update
      router.refresh(); // odświeża dane z serwera, wearKm nie ruszony
    });
  }

  return (
    <>
      <p>{kmSinceLube} km od ostatniego smarowania</p>
      <button disabled={isPending} onClick={action}>
        {isPending ? "Smarowanie..." : "🛢️ Smaruj"}
      </button>
    </>
  );
}

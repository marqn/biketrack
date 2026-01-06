"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addChainLube } from "./actions/add-chain-lube";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

  const [lastLubeKm, setLastLubeKm] = useOptimistic(
    lastLubeKmInitial ?? null,
    (_currentState, newKm: number) => newKm
  );
  const kmSinceLube = lastLubeKm !== null ? currentKm - lastLubeKm : currentKm;

  const progressPercent = Math.min((kmSinceLube / 200) * 100, 100); // zakładam smarowanie co 200 km

  async function action() {
    startTransition(async () => {
      setLastLubeKm(currentKm); // tylko UI
      await addChainLube(bikeId); // server update
      router.refresh(); // odświeża dane z serwera, wearKm nie ruszony
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span>{kmSinceLube} km od ostatniego smarowania</span>
        <Button
          size="sm"
          variant="outline"
          onClick={action}
          disabled={isPending}
        >
          {isPending ? "Smarowanie..." : "🛢️ Smaruj"}
        </Button>
      </div>
      <Progress value={progressPercent} />
    </div>
  );
}

"use client";

import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { NotebookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ColoredProgress from "@/components/ui/colored-progress";
import { CHAIN_LUBE_INTERVAL_KM } from "@/lib/default-parts";
import LubeDialog from "@/components/part-card/LubeDialog";
import LubeHistoryDialog from "@/components/part-card/LubeHistoryDialog";
import {
  lubeChain,
  deleteLubeEvent,
  updateLubeEvent,
} from "@/app/app/actions/lube-service";
import { LubeEvent } from "@/lib/types";

interface LubeButtonProps {
  bikeId: string;
  currentKm: number;
  lastLubeKmInitial?: number | null;
  lubeEvents?: LubeEvent[];
}

export default function LubeButton({
  bikeId,
  currentKm,
  lastLubeKmInitial,
  lubeEvents = [],
}: LubeButtonProps) {
  const [activeDialog, setActiveDialog] = useState<"lube" | "history" | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [lastLubeKm, setLastLubeKm] = useOptimistic(
    lastLubeKmInitial ?? null,
    (_currentState, newKm: number) => newKm
  );

  const kmSinceLube = lastLubeKm !== null ? currentKm - lastLubeKm : currentKm;
  const progressPercent = Math.min(
    (kmSinceLube / CHAIN_LUBE_INTERVAL_KM) * 100,
    100
  );
  const lastLubeEvent = lubeEvents[0]; // Już posortowane desc

  async function handleLube(data: {
    productId?: string;
    brand?: string;
    model?: string;
    lubricantType?: "wax" | "oil";
    unknownProduct?: boolean;
    rating?: number;
    reviewText?: string;
  }) {
    startTransition(async () => {
      setLastLubeKm(currentKm); // Optimistic UI
      await lubeChain({
        bikeId,
        currentKm,
        ...data,
      });
      setActiveDialog(null);
      router.refresh();
    });
  }

  async function handleDelete(eventId: string) {
    startTransition(async () => {
      await deleteLubeEvent(eventId);
      router.refresh();
    });
  }

  async function handleEdit(
    eventId: string,
    data: {
      lubricantBrand?: string;
      lubricantProductId?: string | null;
      notes?: string;
      rating?: number;
      reviewText?: string;
    }
  ) {
    startTransition(async () => {
      await updateLubeEvent(eventId, data);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span>{kmSinceLube} km od ostatniego smarowania</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveDialog("lube")}
              disabled={isPending}
              className="text-muted-foreground"
            >
              {isPending ? "Smarowanie..." : "💧 Smaruj"}
            </Button>
            {lubeEvents.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveDialog("history")}
                className="text-muted-foreground"
                disabled={isPending}
              >
                <NotebookText className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <ColoredProgress value={progressPercent} />
      </div>

      <LubeDialog
        open={activeDialog === "lube"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        currentKm={currentKm}
        lastLubricantProduct={lastLubeEvent?.lubricantProduct}
        onLube={handleLube}
      />

      <LubeHistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        lubeEvents={lubeEvents}
        currentKm={currentKm}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </>
  );
}

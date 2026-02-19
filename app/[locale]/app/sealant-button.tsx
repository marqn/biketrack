"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { NotebookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ColoredProgress from "@/components/ui/colored-progress";
import { SEALANT_INTERVAL_DAYS } from "@/lib/default-parts";
import SealantDialog from "@/components/part-card/SealantDialog";
import SealantHistoryDialog from "@/components/part-card/SealantHistoryDialog";
import {
  changeSealant,
  deleteSealantEvent,
  updateSealantEvent,
} from "@/app/actions/sealant-service";
import { SealantEvent } from "@/lib/types";

interface SealantButtonProps {
  bikeId: string;
  currentKm: number;
  wheel: "front" | "rear";
  sealantEvents?: SealantEvent[];
}

export default function SealantButton({
  bikeId,
  currentKm,
  wheel,
  sealantEvents = [],
}: SealantButtonProps) {
  const [activeDialog, setActiveDialog] = useState<
    "sealant" | "history" | null
  >(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const lastEvent = sealantEvents[0]; // Już posortowane desc
  const daysSinceSealant = lastEvent
    ? Math.floor(
        (Date.now() - new Date(lastEvent.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const progressPercent =
    daysSinceSealant !== null
      ? Math.min((daysSinceSealant / SEALANT_INTERVAL_DAYS) * 100, 100)
      : 0;

  async function handleChangeSealant(data: {
    productId?: string;
    brand?: string;
    model?: string;
    unknownProduct?: boolean;
    rating?: number;
    reviewText?: string;
  }) {
    startTransition(async () => {
      await changeSealant({
        bikeId,
        currentKm,
        wheel,
        ...data,
      });
      setActiveDialog(null);
      router.refresh();
    });
  }

  async function handleDelete(eventId: string) {
    startTransition(async () => {
      await deleteSealantEvent(eventId);
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
      await updateSealantEvent(eventId, data);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span>
            {daysSinceSealant !== null
              ? `${daysSinceSealant} dni od wymiany mleka`
              : "Brak danych o mleku tubeless"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveDialog("sealant")}
              disabled={isPending}
              className="text-muted-foreground"
            >
              {isPending ? "Zapisuję..." : "🧴 Wymień"}
            </Button>
            {sealantEvents.length > 0 && (
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
        {daysSinceSealant !== null && (
          <ColoredProgress value={progressPercent} />
        )}
      </div>

      <SealantDialog
        open={activeDialog === "sealant"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        lastSealantProduct={lastEvent?.lubricantProduct}
        onChangeSealant={handleChangeSealant}
      />

      <SealantHistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        sealantEvents={sealantEvents}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </>
  );
}

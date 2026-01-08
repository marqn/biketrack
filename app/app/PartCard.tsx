"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { replacePart } from "./actions/replace-part";
import { PartType } from "@/lib/generated/prisma";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ColoredProgress from "@/components/ui/colored-progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PartCard({
  partName,
  wearKm,
  expectedKm,
  bikeId,
  partType,
  children,
}: {
  partName: string;
  wearKm: number;
  expectedKm: number;
  bikeId: string;
  partType: PartType;
  children?: React.ReactNode;
}) {
  const [activeDialog, setActiveDialog] = React.useState<DialogType>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const progressPercent = Math.min(
    Math.round((wearKm / expectedKm) * 100),
    100
  );

  function handleReplace() {
    const formData = new FormData();
    formData.set("bikeId", bikeId);
    formData.set("partType", partType);

    startTransition(async () => {
      await replacePart(formData);
      router.refresh();
    });
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {partName}
          <p>
            <button
              onClick={() => setActiveDialog("bike-details")} // lub jak nazwiesz ten dialog
              className="text-xs text-muted-foreground relative after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full cursor-pointer"
            >
              Shimano GRX 820, 48/31
            </button>
          </p>
        </CardTitle>
        {progressPercent >= 100 && <CardAction>🚨</CardAction>}
      </CardHeader>

      <CardContent className="space-y-3">
        <ColoredProgress value={progressPercent} />

        <div className="text-sm text-muted-foreground items-center flex justify-between">
          <span>
            Zużycie:{" "}
            <span className="font-medium text-foreground">{wearKm}</span>
            {" km "}/ {expectedKm} km
          </span>

          <Button
            size={"sm"}
            variant="outline"
            onClick={handleReplace}
            disabled={isPending}
          >
            {isPending ? "Wymieniam..." : "🔄 Wymień"}
          </Button>
        </div>
      </CardContent>

      <CardContent className="space-y-3">{children}</CardContent>

      {/* Dialog */}
      <Dialog
        open={activeDialog === "bike-details"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Szczegóły roweru</DialogTitle>
          </DialogHeader>
          {/* Treść dialogu */}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

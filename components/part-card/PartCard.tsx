"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { NotebookText } from "lucide-react";

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
import { DialogType } from "@/components/bike-header/BikeHeader";
import PartDetailsDialog from "./PartDetailsDialog";
import PartHistoryDialog from "./PartHistoryDialog";
import ReplacePartDialog from "./ReplacePartDialog";
import {
  replacePart,
  deletePartReplacement,
  updatePartReplacement,
} from "@/app/app/actions/replace-part";

interface PartReplacement {
  id: string;
  brand: string | null;
  model: string | null;
  notes: string | null;
  kmAtReplacement: number;
  kmUsed: number;
  createdAt: Date;
}

interface PartCardProps {
  partName: string;
  wearKm: number;
  expectedKm: number;
  bikeId: string;
  partId?: string; // 👈 Opcjonalne, bo czasem możesz nie mieć
  partType: PartType;
  replacements?: PartReplacement[];
  children?: React.ReactNode;
}

export default function PartCard({
  partName,
  wearKm,
  expectedKm,
  bikeId,
  partId,
  partType,
  replacements = [],
  children,
}: PartCardProps) {
  const [activeDialog, setActiveDialog] = React.useState<DialogType | "replace" | "history">(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const progressPercent = Math.min(
    Math.round((wearKm / expectedKm) * 100),
    100
  );

  async function handleReplace(data: {
    brand?: string;
    model?: string;
    notes?: string;
  }) {
    const formData = new FormData();
    formData.set("bikeId", bikeId);
    formData.set("partType", partType);
    if (data.brand) formData.set("brand", data.brand);
    if (data.model) formData.set("model", data.model);
    if (data.notes) formData.set("notes", data.notes);

    startTransition(async () => {
      await replacePart(formData);
      setActiveDialog(null);
      router.refresh();
    });
  }

  async function handleDelete(replacementId: string) {
    startTransition(async () => {
      await deletePartReplacement(replacementId);
      router.refresh();
    });
  }

  async function handleEdit(
    replacementId: string,
    data: { brand?: string; model?: string; notes?: string }
  ) {
    startTransition(async () => {
      await updatePartReplacement(replacementId, data);
      router.refresh();
    });
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {partName}
            <p>
              <button
                onClick={() => setActiveDialog("bike-details")}
                className="text-xs text-muted-foreground relative after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full cursor-pointer"
              >
                Dodaj model
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

            <span className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveDialog("replace")}
                disabled={isPending}
              >
                {isPending ? "Wymieniam..." : "🔄 Wymień"}
              </Button>
              {replacements.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveDialog("history")}
                >
                  <NotebookText className="h-4 w-4" />
                </Button>
              )}
            </span>
          </div>
        </CardContent>

        {children && <CardContent className="space-y-3">{children}</CardContent>}
      </Card>

      <PartDetailsDialog
        open={activeDialog === "bike-details"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        partName={partName}
      />

      <ReplacePartDialog
        open={activeDialog === "replace"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        partName={partName}
        onReplace={handleReplace}
      />

      <PartHistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        partName={partName}
        replacements={replacements}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </>
  );
}
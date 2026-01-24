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
import {
  deletePartReplacement,
  updatePartReplacement,
} from "@/app/app/actions/replace-part";
import { PartReplacement, BikePartWithProduct } from "@/lib/types";
import { useMultiDialog } from "@/lib/hooks/useDialog";

interface PartCardProps {
  partName: string;
  wearKm: number;
  expectedKm: number;
  bikeId: string;
  partId?: string;
  partType: PartType;
  replacements?: PartReplacement[];
  currentBrand?: string | null;
  currentModel?: string | null;
  currentPart?: Partial<BikePartWithProduct> | null;
  children?: React.ReactNode;
}

export default function PartCard({
  partName,
  wearKm,
  expectedKm,
  currentPart,
  bikeId,
  partId,
  partType,
  replacements = [],
  currentBrand,
  currentModel,
  children,
}: PartCardProps) {
  const { activeDialog, openDialog, closeDialog } = useMultiDialog<
    DialogType | "replace" | "history"
  >();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const progressPercent = Math.min(
    Math.round((wearKm / expectedKm) * 100),
    100
  );

  // Określ czy jest to edit czy create
  const hasCurrentPart = !!(currentBrand && currentModel);

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
                onClick={() => openDialog("bike-details")}
                className="text-xs text-muted-foreground relative after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full cursor-pointer"
              >
                {currentBrand || currentModel
                  ? currentBrand && currentModel
                    ? `${currentBrand} ${currentModel}`
                    : currentBrand || currentModel
                  : "Dodaj model"}
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
                onClick={() => openDialog("replace")}
                disabled={isPending}
              >
                {isPending ? "Wymieniam..." : "🔄 Wymień"}
              </Button>
              {replacements.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDialog("history")}
                >
                  <NotebookText className="h-4 w-4" />
                </Button>
              )}
            </span>
          </div>
        </CardContent>

        {children && (
          <CardContent className="space-y-3">{children}</CardContent>
        )}
      </Card>

      {/* Dialog dla edycji istniejącej części */}
      <PartDetailsDialog
        open={activeDialog === "bike-details"}
        onOpenChange={(open) => !open && closeDialog()}
        partType={partType}
        partName={partName}
        partId={partId || ""}
        bikeId={bikeId}
        mode={hasCurrentPart ? "edit" : "create"}
        currentPart={currentPart}
      />

      {/* Dialog dla wymiany (zawsze create) */}
      <PartDetailsDialog
        open={activeDialog === "replace"}
        onOpenChange={(open) => !open && closeDialog()}
        partType={partType}
        partName={partName}
        partId={partId || ""}
        bikeId={bikeId}
        mode="create"
        currentPart={null}
      />

      <PartHistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => !open && closeDialog()}
        partName={partName}
        replacements={replacements}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </>
  );
}
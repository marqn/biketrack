"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { NotebookText, Link, Unlink } from "lucide-react";
import { BikeType, PartType } from "@/lib/generated/prisma";
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
import { SEALANT_INTERVAL_DAYS, BRAKE_FLUID_INTERVAL_DAYS } from "@/lib/default-parts";
import {
  deletePartReplacement,
  updatePartReplacement,
} from "@/app/app/actions/replace-part";
import { togglePartInstalled } from "@/app/app/actions/toggle-part-installed";
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
  isAccessory?: boolean;
  isInstalled?: boolean;
  createdAt?: Date | string;
  bikeType?: BikeType;
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
  isAccessory = false,
  isInstalled = true,
  createdAt,
  bikeType,
}: PartCardProps) {
  const { activeDialog, openDialog, closeDialog } = useMultiDialog<
    DialogType | "replace" | "history"
  >();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isTimeBased = partType === PartType.TUBELESS_SEALANT || partType === PartType.BRAKE_FLUID;
  const timeIntervalDays = partType === PartType.BRAKE_FLUID
    ? BRAKE_FLUID_INTERVAL_DAYS
    : SEALANT_INTERVAL_DAYS;
  const timeBasedDate = isTimeBased
    ? (currentPart?.installedAt || createdAt)
    : null;
  const daysSinceInstall = timeBasedDate
    ? Math.floor((Date.now() - new Date(timeBasedDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const progressPercent = isTimeBased && timeBasedDate
    ? Math.min(Math.round((daysSinceInstall / timeIntervalDays) * 100), 100)
    : Math.min(Math.round((wearKm / expectedKm) * 100), 100);

  // Określ czy jest to edit czy create
  const hasCurrentPart = !!(currentBrand && currentModel);
  const canReplace = hasCurrentPart || (isTimeBased && !!currentPart?.installedAt);

  async function handleToggleInstalled(checked: boolean) {
    if (!partId) return;
    startTransition(async () => {
      await togglePartInstalled(partId, checked);
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
      <Card className={`mt-4 ${isAccessory && !isInstalled ? "opacity-50" : ""}`}>
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
          <CardAction className="flex items-center gap-2">
            {progressPercent >= 100 && <span>🚨</span>}
            {isAccessory && partId && (
              <Button
                size="icon"
                variant={isInstalled ? "default" : "outline"}
                onClick={() => handleToggleInstalled(!isInstalled)}
                disabled={isPending}
                title={isInstalled ? "Zdejmij z roweru" : "Zamontuj na rowerze"}
                className="h-8 w-8"
              >
                {isInstalled ? (
                  <Link className="h-4 w-4" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
              </Button>
            )}
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-3">
          <ColoredProgress value={progressPercent} />

          <div className="text-sm text-muted-foreground items-center flex justify-between">
            <span>
              {isTimeBased && timeBasedDate ? (
                <>
                  Wiek:{" "}
                  <span className="font-medium text-foreground">{daysSinceInstall}</span>
                  {" dni "}/ {timeIntervalDays} dni
                </>
              ) : (
                <>
                  Zużycie:{" "}
                  <span className="font-medium text-foreground">{wearKm}</span>
                  {" km "}/ {expectedKm} km
                </>
              )}
            </span>

            <span className="flex items-center gap-2">
              {canReplace && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDialog("replace")}
                  disabled={isPending}
                >
                  {isPending ? "Wymieniam..." : "🔄 Wymień"}
                </Button>
              )}
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
        mode={canReplace ? "edit" : "create"}
        currentPart={currentPart}
        bikeType={bikeType}
      />

      {/* Dialog dla wymiany */}
      <PartDetailsDialog
        open={activeDialog === "replace"}
        onOpenChange={(open) => !open && closeDialog()}
        partType={partType}
        partName={partName}
        partId={partId || ""}
        mode="replace"
        currentPart={currentPart}
        bikeType={bikeType}
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
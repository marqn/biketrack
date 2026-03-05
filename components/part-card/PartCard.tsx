"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { NotebookText, Link, Unlink, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { BikeType, PartType } from "@/lib/generated/prisma";
import { PartIcon } from "@/lib/part-icons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NumberStepper from "@/components/ui/number-stepper";
import ColoredProgress from "@/components/ui/colored-progress";
import { DialogType } from "@/components/bike-header/BikeHeader";
import PartDetailsDialog from "./PartDetailsDialog";
import PartHistoryDialog from "./PartHistoryDialog";
import {
  SEALANT_INTERVAL_DAYS,
  BRAKE_FLUID_INTERVAL_DAYS,
} from "@/lib/default-parts";
import {
  deletePartReplacement,
  updatePartReplacement,
} from "@/app/app/actions/replace-part";
import { togglePartInstalled } from "@/app/app/actions/toggle-part-installed";
import { updatePartWear } from "@/app/app/actions/update-part-wear";
import { PartReplacement, BikePartWithProduct } from "@/lib/types";
import { useMultiDialog } from "@/lib/hooks/useDialog";
import { useSession } from "next-auth/react";
import { formatDistance, displayKm, distanceUnit, inputToKm } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";

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

function WearEditor({
  partId,
  wearKm,
  expectedKm,
  unitPref,
  onSaved,
}: {
  partId: string;
  wearKm: number;
  expectedKm: number;
  unitPref: UnitPreference;
  onSaved: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [wearVal, setWearVal] = React.useState(displayKm(wearKm, unitPref));
  const [expectedVal, setExpectedVal] = React.useState(displayKm(expectedKm, unitPref));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const unit = distanceUnit(unitPref);

  React.useEffect(() => {
    if (open) {
      setWearVal(displayKm(wearKm, unitPref));
      setExpectedVal(displayKm(expectedKm, unitPref));
      setError(null);
    }
  }, [open, wearKm, expectedKm, unitPref]);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await updatePartWear(
        partId,
        Math.round(inputToKm(wearVal, unitPref)),
        Math.round(inputToKm(expectedVal, unitPref)),
      );
      setOpen(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd zapisu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors group text-left"
          title="Edytuj zużycie"
        >
          <>
            Zużycie:{" "}
            <span className="font-medium text-foreground">{formatDistance(wearKm, unitPref)}</span>
            {" / "}{formatDistance(expectedKm, unitPref)}
          </>
          <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <p className="text-xs font-medium mb-3">Edytuj zużycie</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Aktualne zużycie ({unit})
            </label>
            <NumberStepper
              value={wearVal}
              onChange={setWearVal}
              steps={[10, 100]}
              min={0}
              disabled={saving}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Oczekiwana trwałość ({unit})
            </label>
            <NumberStepper
              value={expectedVal}
              onChange={setExpectedVal}
              steps={[100, 1000]}
              min={1}
              disabled={saving}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button size="sm" className="h-7 text-xs w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Zapisuję..." : "Zapisz"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
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
  const { data: session } = useSession();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";

  const isTimeBased =
    partType === PartType.TUBELESS_SEALANT_FRONT || partType === PartType.TUBELESS_SEALANT_REAR || partType === PartType.BRAKE_FLUID;
  const timeIntervalDays =
    partType === PartType.BRAKE_FLUID
      ? BRAKE_FLUID_INTERVAL_DAYS
      : SEALANT_INTERVAL_DAYS;
  const timeBasedDate = isTimeBased
    ? currentPart?.installedAt || createdAt
    : null;
  const daysSinceInstall = timeBasedDate
    ? Math.floor(
        (Date.now() - new Date(timeBasedDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const progressPercent =
    isTimeBased && timeBasedDate
      ? Math.min(Math.round((daysSinceInstall / timeIntervalDays) * 100), 100)
      : Math.min(Math.round((wearKm / expectedKm) * 100), 100);

  // Określ czy jest to edit czy create
  const hasCurrentPart = !!(currentBrand && currentModel);
  const isUnknownProduct = !hasCurrentPart && !!currentPart?.installedAt;
  const canReplace =
    hasCurrentPart || isUnknownProduct || (isTimeBased && !!currentPart?.installedAt);

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
    data: { brand?: string; model?: string; notes?: string },
  ) {
    startTransition(async () => {
      await updatePartReplacement(replacementId, data);
      router.refresh();
    });
  }

  return (
    <>
      <Card className={isAccessory && !isInstalled ? "opacity-50" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex gap-2 flex-col items-start">
            <div className="flex items-center gap-2">
              <PartIcon type={partType} className="w-5 h-5 shrink-0" />
              {partName}
            </div>
            <button
              onClick={() => openDialog("bike-details")}
              className={cn(
                "text-xs relative after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full cursor-pointer flex items-center gap-1",
                currentBrand || currentModel
                  ? "text-muted-foreground"
                  : isUnknownProduct
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              {currentBrand || currentModel
                ? currentBrand && currentModel
                  ? `${currentBrand} ${currentModel}`
                  : currentBrand || currentModel
                : isUnknownProduct
                  ? <><Pencil className="w-3 h-3" />Uzupełnij markę i model</>
                  : progressPercent > 50
                    ? "Aby wymienić dodaj aktualny model"
                    : "Dodaj model"}
            </button>
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
                className="h-8 w-8 cursor-pointer"
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
                  <span className="font-medium text-foreground">
                    {daysSinceInstall}
                  </span>
                  {" dni "}/ {timeIntervalDays} dni
                </>
              ) : partId ? (
                <WearEditor
                  partId={partId}
                  wearKm={wearKm}
                  expectedKm={expectedKm}
                  unitPref={unitPref}
                  onSaved={() => router.refresh()}
                />
              ) : (
                <>
                  Zużycie:{" "}
                  <span className="font-medium text-foreground">{formatDistance(wearKm, unitPref)}</span>
                  {" / "}{formatDistance(expectedKm, unitPref)}
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

      {/* Dialog dla podglądu/edycji istniejącej części */}
      <PartDetailsDialog
        open={activeDialog === "bike-details"}
        onOpenChange={(open) => !open && closeDialog()}
        partType={partType}
        partName={partName}
        partId={partId || ""}
        mode={hasCurrentPart ? "view" : canReplace ? "edit" : "create"}
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

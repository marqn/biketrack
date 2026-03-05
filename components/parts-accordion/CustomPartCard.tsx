"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Pencil, Trash2, NotebookText } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ColoredProgress from "@/components/ui/colored-progress";
import { deleteCustomPart, updateCustomPartWear } from "@/app/app/actions/custom-part";
import { useMultiDialog } from "@/lib/hooks/useDialog";
import CustomPartDetailsDialog from "./CustomPartDetailsDialog";
import CustomPartHistoryDialog from "./CustomPartHistoryDialog";
import { useSession } from "next-auth/react";
import { formatDistance, displayKm, distanceUnit, inputToKm } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";

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
      await updateCustomPartWear(
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
          {expectedKm > 0 ? (
            <>
              Zużycie:{" "}
              <span className="font-medium text-foreground">{formatDistance(wearKm, unitPref)}</span>
              {" / "}{formatDistance(expectedKm, unitPref)}
            </>
          ) : (
            <>
              Przebieg:{" "}
              <span className="font-medium text-foreground">{formatDistance(wearKm, unitPref)}</span>
            </>
          )}
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
              min={0}
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

interface CustomPartCardProps {
  id: string;
  name: string;
  wearKm: number;
  expectedKm: number;
  brand?: string | null;
  model?: string | null;
  installedAt?: Date | string | null;
}

export default function CustomPartCard({
  id,
  name,
  wearKm,
  expectedKm,
  brand,
  model,
  installedAt,
}: CustomPartCardProps) {
  const { activeDialog, openDialog, closeDialog } = useMultiDialog<"details" | "replace" | "history" | "confirm-delete">();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session } = useSession();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";

  const hasLimit = expectedKm > 0;
  const progressPercent = hasLimit
    ? Math.min(Math.round((wearKm / expectedKm) * 100), 100)
    : 0;

  const hasBrandModel = !!(brand || model);

  function handleDelete() {
    startTransition(async () => {
      await deleteCustomPart(id);
      router.refresh();
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex gap-2 flex-col items-start">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 shrink-0 text-muted-foreground" />
              {name}
            </div>
            <button
              onClick={() => openDialog("details")}
              className="text-xs relative after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full cursor-pointer flex items-center gap-1 text-muted-foreground"
            >
              {hasBrandModel
                ? brand && model
                  ? `${brand} ${model}`
                  : brand || model
                : (
                  <>
                    <Pencil className="w-3 h-3" />
                    Dodaj markę i model
                  </>
                )}
            </button>
          </CardTitle>
          <CardAction className="flex items-center gap-1">
            {progressPercent >= 100 && <span>🚨</span>}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => openDialog("confirm-delete")}
              disabled={isPending}
              title="Usuń część"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-3">
          {hasLimit && <ColoredProgress value={progressPercent} />}

          <div className="text-sm text-muted-foreground items-center flex justify-between">
            <span>
              <WearEditor
                partId={id}
                wearKm={wearKm}
                expectedKm={expectedKm}
                unitPref={unitPref}
                onSaved={() => router.refresh()}
              />
            </span>

            <span className="flex items-center gap-2">
              {hasBrandModel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDialog("replace")}
                  disabled={isPending}
                >
                  🔄 Wymień
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => openDialog("history")}
                title="Historia wymian"
              >
                <NotebookText className="h-4 w-4" />
              </Button>
            </span>
          </div>
        </CardContent>
      </Card>

      <CustomPartDetailsDialog
        open={activeDialog === "details"}
        onOpenChange={(open) => !open && closeDialog()}
        partId={id}
        partName={name}
        currentBrand={brand}
        currentModel={model}
        currentInstalledAt={installedAt}
      />

      <CustomPartDetailsDialog
        open={activeDialog === "replace"}
        onOpenChange={(open) => !open && closeDialog()}
        partId={id}
        partName={name}
        mode="replace"
      />

      <CustomPartHistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => !open && closeDialog()}
        partId={id}
        partName={name}
        unitPref={unitPref}
      />

      <AlertDialog
        open={activeDialog === "confirm-delete"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć część &quot;{name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Część zostanie trwale usunięta wraz z historią zużycia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? "Usuwam..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

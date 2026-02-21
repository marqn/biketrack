"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { replaceCustomPart, deleteCustomPart } from "@/app/app/actions/custom-part";
import { useMultiDialog } from "@/lib/hooks/useDialog";
import CustomPartDetailsDialog from "./CustomPartDetailsDialog";
import { useSession } from "next-auth/react";
import { formatDistance } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";

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
  const { activeDialog, openDialog, closeDialog } = useMultiDialog<"details" | "confirm-delete">();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session } = useSession();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";

  const hasLimit = expectedKm > 0;
  const progressPercent = hasLimit
    ? Math.min(Math.round((wearKm / expectedKm) * 100), 100)
    : 0;

  const hasBrandModel = !!(brand || model);

  function handleReplace() {
    startTransition(async () => {
      await replaceCustomPart(id);
      router.refresh();
    });
  }

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
              {hasLimit ? (
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
            </span>

            {hasBrandModel && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReplace}
                disabled={isPending}
              >
                {isPending ? "Wymieniam..." : "🔄 Wymień"}
              </Button>
            )}
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

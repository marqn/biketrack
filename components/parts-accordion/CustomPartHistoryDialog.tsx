"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/bike-header/dialogs";
import { getCustomPartHistory, deleteCustomStoredPart } from "@/app/app/actions/custom-part";
import { formatDistance } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";

interface HistoryEntry {
  id: string;
  brand: string | null;
  model: string | null;
  wearKm: number;
  expectedKm: number;
  installedAt: Date | string | null;
  removedAt: Date | string | null;
  createdAt: Date | string;
}

interface CustomPartHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partId: string;
  partName: string;
  unitPref: UnitPreference;
}

export default function CustomPartHistoryDialog({
  open,
  onOpenChange,
  partId,
  partName,
  unitPref,
}: CustomPartHistoryDialogProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getCustomPartHistory(partId)
      .then((data) => setHistory(data as HistoryEntry[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, partId]);

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteCustomStoredPart(deleteId);
      setHistory((prev) => prev.filter((h) => h.id !== deleteId));
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Historia wymian: {partName}</DialogTitle>
          </DialogHeader>

          <div
            className="custom-scrollbar space-y-3 overflow-y-auto -mx-6 pl-6 pr-8"
            style={{ maxHeight: "calc(90vh - 200px)" }}
          >
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Ładowanie...
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Brak historii wymian dla tej części
              </div>
            ) : (
              history.map((entry, index) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          Wymiana #{history.length - index}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.removedAt
                            ? format(new Date(entry.removedAt), "d MMM yyyy", { locale: pl })
                            : format(new Date(entry.createdAt), "d MMM yyyy", { locale: pl })}
                        </span>
                      </div>

                      {(entry.brand || entry.model) && (
                        <div className="text-sm">
                          {[entry.brand, entry.model].filter(Boolean).join(" ")}
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground mt-2 space-y-0.5">
                        <div>
                          Przejechane przez komponent:{" "}
                          <span className="font-medium text-foreground">
                            {formatDistance(entry.wearKm, unitPref)}
                          </span>
                        </div>
                        {entry.installedAt && (
                          <div>
                            Zamontowana:{" "}
                            <span className="font-medium text-foreground">
                              {format(new Date(entry.installedAt), "d MMM yyyy", { locale: pl })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(entry.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        itemName="wymian"
      />
    </>
  );
}

"use client";

import * as React from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EditLubeDialog from "./EditLubeDialog";
import { ConfirmDeleteDialog } from "../bike-header/dialogs";
import { LubeEvent } from "@/lib/types";
import { useDialogWithActions } from "@/lib/hooks/useDialog";
import { LubricantSpecificData } from "@/lib/part-specific-data";

interface LubeHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lubeEvents: LubeEvent[];
  currentKm: number;
  onDelete: (id: string) => Promise<void>;
  onEdit: (
    id: string,
    data: {
      lubricantBrand?: string;
      lubricantProductId?: string | null;
      notes?: string;
      rating?: number;
      reviewText?: string;
    }
  ) => Promise<void>;
}

export default function LubeHistoryDialog({
  open,
  onOpenChange,
  lubeEvents,
  currentKm,
  onDelete,
  onEdit,
}: LubeHistoryDialogProps) {
  const {
    editId,
    deleteId,
    startEdit,
    cancelEdit,
    startDelete,
    cancelDelete,
  } = useDialogWithActions<string>();

  const sortedEvents = [...lubeEvents].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const editingEvent = sortedEvents.find((e) => e.id === editId);

  async function handleDelete() {
    if (!deleteId) return;
    await onDelete(deleteId);
    cancelDelete();
  }

  function getLubricantTypeLabel(specs: unknown): string | null {
    const data = specs as Partial<LubricantSpecificData> | null;
    if (!data?.lubricantType) return null;
    return data.lubricantType === "wax" ? "Wosk" : "Smar";
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Historia smarowania łańcucha</DialogTitle>
          </DialogHeader>

          <div
            className="custom-scrollbar space-y-3 overflow-y-auto -mx-6 pl-6 pr-8"
            style={{ maxHeight: "calc(90vh - 200px)" }}
          >
            {sortedEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Brak historii smarowania
              </div>
            ) : (
              <>
                {sortedEvents.map((event, index) => {
                  const kmSinceLube = currentKm - event.kmAtTime;
                  const product = event.lubricantProduct;
                  const lubricantTypeLabel = product
                    ? getLubricantTypeLabel(product.specifications)
                    : null;

                  return (
                    <div
                      key={event.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {index === 0
                                ? "Ostatnie smarowanie"
                                : `Smarowanie #${sortedEvents.length - index}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(event.createdAt),
                                "d MMM yyyy",
                                {
                                  locale: pl,
                                }
                              )}
                            </span>
                          </div>

                          {/* Produkt */}
                          {product ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">
                                {product.brand} {product.model}
                              </span>
                              {lubricantTypeLabel && (
                                <Badge variant="secondary" className="text-xs">
                                  {lubricantTypeLabel}
                                </Badge>
                              )}
                              {product.averageRating !== null &&
                                product.averageRating > 0 &&
                                product.totalReviews > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    ⭐ {product.averageRating.toFixed(1)} (
                                    {product.totalReviews})
                                  </span>
                                )}
                            </div>
                          ) : event.lubricantBrand ? (
                            <div className="text-sm">
                              <span className="font-medium">
                                {event.lubricantBrand}
                              </span>
                            </div>
                          ) : null}

                          <div className="text-sm text-muted-foreground mt-2">
                            <div>
                              Przebieg przy smarowaniu:{" "}
                              <span className="font-medium text-foreground">
                                {event.kmAtTime} km
                              </span>
                            </div>
                            {index === 0 && (
                              <div>
                                Przejechane od smarowania:{" "}
                                <span className="font-medium text-foreground">
                                  {kmSinceLube} km
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Ocena użytkownika */}
                          {event.reviews?.[0] && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Twoja ocena:
                              </span>
                              <span className="text-yellow-500">
                                {"★".repeat(event.reviews[0].rating)}
                                {"☆".repeat(5 - event.reviews[0].rating)}
                              </span>
                            </div>
                          )}

                          {/* Opinia / notatki */}
                          {(event.reviews?.[0]?.reviewText || event.notes) && (
                            <div className="mt-2 text-sm text-muted-foreground italic">
                              {event.reviews?.[0]?.reviewText || event.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 ml-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(event.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startDelete(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={cancelDelete}
        onConfirm={handleDelete}
        itemName="smarowania"
      />

      {editingEvent && (
        <EditLubeDialog
          open={!!editId}
          onOpenChange={cancelEdit}
          lubeEvent={editingEvent}
          onSave={async (data) => {
            if (editId) {
              await onEdit(editId, data);
              cancelEdit();
            }
          }}
        />
      )}
    </>
  );
}

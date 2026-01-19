"use client";

import * as React from "react";
import { useState } from "react";
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

import EditReplacementDialog from "./EditReplacementDialog";

interface PartReplacement {
  id: string;
  brand: string | null;
  model: string | null;
  notes: string | null;
  kmAtReplacement: number;
  kmUsed: number;
  createdAt: Date;
}

interface PartHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partName: string;
  replacements: PartReplacement[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, data: { brand?: string; model?: string; notes?: string }) => Promise<void>;
}

export default function PartHistoryDialog({
  open,
  onOpenChange,
  partName,
  replacements,
  onDelete,
  onEdit,
}: PartHistoryDialogProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const sortedReplacements = [...replacements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const editingReplacement = sortedReplacements.find((r) => r.id === editId);

  async function handleDelete() {
    if (!deleteId) return;
    await onDelete(deleteId);
    setDeleteId(null);
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
            {sortedReplacements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Brak historii wymian dla tego komponentu
              </div>
            ) : (
              <>
                {sortedReplacements.map((replacement, index) => (
                  <div
                    key={replacement.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {index === 0 ? "Obecny komponent" : `Wymiana #${sortedReplacements.length - index}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(replacement.createdAt), "d MMM yyyy", {
                              locale: pl,
                            })}
                          </span>
                        </div>

                        {(replacement.brand || replacement.model) && (
                          <div className="text-sm">
                            {replacement.brand && (
                              <span className="font-medium">{replacement.brand}</span>
                            )}
                            {replacement.brand && replacement.model && " "}
                            {replacement.model && <span>{replacement.model}</span>}
                          </div>
                        )}

                        <div className="text-sm text-muted-foreground mt-2">
                          <div>
                            Przebieg przy wymianie:{" "}
                            <span className="font-medium text-foreground">
                              {replacement.kmAtReplacement} km
                            </span>
                          </div>
                          <div>
                            Przejechane przez komponent:{" "}
                            <span className="font-medium text-foreground">
                              {replacement.kmUsed} km
                            </span>
                          </div>
                        </div>

                        {replacement.notes && (
                          <div className="mt-2 text-sm text-muted-foreground italic">
                            {replacement.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1 ml-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditId(replacement.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(replacement.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć wpis z historii?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Wpis zostanie trwale usunięty z historii
              wymian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingReplacement && (
        <EditReplacementDialog
          open={!!editId}
          onOpenChange={() => setEditId(null)}
          replacement={editingReplacement}
          onSave={async (data) => {
            if (editId) {
              await onEdit(editId, data);
              setEditId(null);
            }
          }}
        />
      )}
    </>
  );
}
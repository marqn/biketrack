"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Wrench, PackageOpen, Pencil, Star } from "lucide-react";
import { PartType } from "@/lib/generated/prisma";
import { PartIcon } from "@/lib/part-icons";
import { getPartName } from "@/lib/default-parts";
import { formatDistance } from "@/lib/units";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/bike-header/dialogs";
import { installGaragePart } from "@/app/app/actions/garage/install-garage-part";
import { deleteStoredPart } from "@/app/app/actions/garage/delete-stored-part";
import { updateStoredPart } from "@/app/app/actions/garage/update-stored-part";
import { toast } from "sonner";

export interface StoredPartData {
  id: string;
  partType: PartType;
  brand: string | null;
  model: string | null;
  wearKm: number;
  expectedKm: number;
  notes: string | null;
  removedAt: Date | string | null;
  fromBikeName: string | null;
  productImageUrl: string | null;
  productId: string | null;
  averageRating: number | null;
  totalReviews: number;
}

export interface BikeOption {
  id: string;
  label: string;
}

interface InstallDialogState {
  open: boolean;
  partId: string;
  partName: string;
}

interface EditNotesDialogState {
  open: boolean;
  partId: string;
  currentNotes: string;
}

interface DeleteDialogState {
  open: boolean;
  partId: string;
}

interface GarageListProps {
  parts: StoredPartData[];
  bikes: BikeOption[];
  unitPref: "METRIC" | "IMPERIAL";
}

export default function GarageList({ parts, bikes, unitPref }: GarageListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [installDialog, setInstallDialog] = useState<InstallDialogState>({
    open: false,
    partId: "",
    partName: "",
  });
  const [selectedBikeId, setSelectedBikeId] = useState<string>("");
  const [editDialog, setEditDialog] = useState<EditNotesDialogState>({
    open: false,
    partId: "",
    currentNotes: "",
  });
  const [editNotes, setEditNotes] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    partId: "",
  });

  if (parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <PackageOpen className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">Garaż jest pusty</p>
          <p className="text-sm text-muted-foreground mt-1">
            Przy wymianie części zaznacz opcję &quot;Zachowaj starą część w garażu&quot;
          </p>
        </div>
      </div>
    );
  }

  function handleInstallClick(part: StoredPartData) {
    setSelectedBikeId(bikes[0]?.id ?? "");
    setInstallDialog({ open: true, partId: part.id, partName: getPartName(part.partType) });
  }

  function handleInstall() {
    if (!selectedBikeId) return;
    startTransition(async () => {
      try {
        await installGaragePart(installDialog.partId, selectedBikeId);
        setInstallDialog({ open: false, partId: "", partName: "" });
        toast.success("Część zainstalowana na rowerze");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Błąd instalacji");
      }
    });
  }

  function handleEditClick(part: StoredPartData) {
    setEditNotes(part.notes ?? "");
    setEditDialog({ open: true, partId: part.id, currentNotes: part.notes ?? "" });
  }

  function handleEditSave() {
    startTransition(async () => {
      try {
        await updateStoredPart(editDialog.partId, { notes: editNotes });
        setEditDialog({ open: false, partId: "", currentNotes: "" });
        router.refresh();
      } catch {
        toast.error("Nie udało się zapisać notatek");
      }
    });
  }

  function handleDeleteConfirm() {
    startTransition(async () => {
      try {
        await deleteStoredPart(deleteDialog.partId);
        setDeleteDialog({ open: false, partId: "" });
        toast.success("Część usunięta z garażu");
        router.refresh();
      } catch {
        toast.error("Nie udało się usunąć części");
      }
    });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {parts.map((part) => {
          const partName = getPartName(part.partType);
          const wearPercent = part.expectedKm > 0
            ? Math.round((part.wearKm / part.expectedKm) * 100)
            : null;

          return (
            <Card key={part.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PartIcon type={part.partType} className="w-5 h-5 shrink-0" />
                  {partName}
                </CardTitle>
                <CardAction className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleEditClick(part)}
                    title="Edytuj notatki"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteDialog({ open: true, partId: part.id })}
                    title="Usuń z garażu"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent className="space-y-3">
                {(part.productImageUrl || part.productId) && (
                  <div className="flex items-start gap-3">
                    {part.productImageUrl && (
                      <img
                        src={part.productImageUrl}
                        alt={`${part.brand} ${part.model}`}
                        className="h-16 w-16 object-contain rounded shrink-0"
                      />
                    )}
                    {part.productId && (
                      <Link
                        href={`/app/products/${part.productId}/reviews`}
                        className="flex flex-col gap-1 hover:opacity-80 transition-opacity"
                      >
                        {part.averageRating !== null && (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${
                                  s <= Math.round(part.averageRating!)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({part.totalReviews})
                            </span>
                          </div>
                        )}
                      </Link>
                    )}
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  {part.brand || part.model ? (
                    <p className="font-medium">
                      {[part.brand, part.model].filter(Boolean).join(" ")}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">Nieznana marka/model</p>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>
                      Zużycie: {formatDistance(part.wearKm, unitPref)}
                      {part.expectedKm > 0 && (
                        <> / {formatDistance(part.expectedKm, unitPref)}</>
                      )}
                    </span>
                    {wearPercent !== null && (
                      <Badge variant={wearPercent >= 100 ? "destructive" : "secondary"}>
                        {wearPercent}%
                      </Badge>
                    )}
                  </div>

                  {part.removedAt && (
                    <p className="text-muted-foreground">
                      Zdjęta: {formatDate(new Date(part.removedAt))}
                    </p>
                  )}

                  {part.fromBikeName && (
                    <p className="text-muted-foreground text-xs">
                      z roweru: {part.fromBikeName}
                    </p>
                  )}

                  {part.notes && (
                    <p className="text-xs text-muted-foreground border-l-2 pl-2 mt-1">
                      {part.notes}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleInstallClick(part)}
                  disabled={isPending || bikes.length === 0}
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  Zainstaluj na rower
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog instalacji */}
      <Dialog
        open={installDialog.open}
        onOpenChange={(open) => !open && setInstallDialog({ open: false, partId: "", partName: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zainstaluj: {installDialog.partName}</DialogTitle>
            <DialogDescription>
              Wybierz rower, na który chcesz zainstalować część z garażu.
              Aktualna część tego typu zostanie zapisana w historii.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={selectedBikeId} onValueChange={setSelectedBikeId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz rower" />
              </SelectTrigger>
              <SelectContent>
                {bikes.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInstallDialog({ open: false, partId: "", partName: "" })}
            >
              Anuluj
            </Button>
            <Button onClick={handleInstall} disabled={isPending || !selectedBikeId}>
              {isPending ? "Instaluję..." : "Zainstaluj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog edycji notatek */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => !open && setEditDialog({ open: false, partId: "", currentNotes: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj notatki</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Stan techniczny, uwagi..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, partId: "", currentNotes: "" })}
            >
              Anuluj
            </Button>
            <Button onClick={handleEditSave} disabled={isPending}>
              {isPending ? "Zapisuję..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog potwierdzenia usunięcia */}
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, partId: "" })}
        onConfirm={handleDeleteConfirm}
        title="Usunąć część z garażu?"
        description="Część zostanie trwale usunięta. Tej operacji nie można cofnąć."
      />
    </>
  );
}

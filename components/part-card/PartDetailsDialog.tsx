"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface PartDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partName: string;
}

export default function PartDetailsDialog({
  open,
  onOpenChange,
  partName,
}: PartDetailsDialogProps) {
  const [rating, setRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Dodaj część rowerową</DialogTitle>
          <DialogDescription>
            Określ model części oraz jej parametry użytkowe
          </DialogDescription>
        </DialogHeader>

        <div
          className="custom-scrollbar space-y-6 overflow-y-auto -mx-6 pl-6 pr-8"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {/* === Podstawowe informacje === */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Podstawowe informacje</h4>

            <div className="h-8 rounded-lg border border-input bg-muted/30 px-2.5 py-1 text-sm flex items-center">
              {partName}
            </div>

            <Input placeholder="Producent (np. Continental)" />
            <Input placeholder="Model (np. GP5000)" />
          </div>

          {/* === Parametry techniczne (dynamiczne) === */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Parametry techniczne</h4>

            {/* przykład dla opony */}
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Szerokość (mm)" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Średnica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="700c">700c</SelectItem>
                  <SelectItem value="29">29"</SelectItem>
                  <SelectItem value="27.5">27.5"</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="tubeless" />
              <label htmlFor="tubeless" className="text-sm">
                Tubeless
              </label>
            </div>
          </div>

          {/* === Użytkowanie === */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Użytkowanie</h4>

            <Input type="date" />

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Stan początkowy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nowa</SelectItem>
                <SelectItem value="used">Używana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* === Opinia === */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Opinia (opcjonalnie)</h4>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-2xl transition-colors focus:outline-none"
                >
                  {star <= (hoveredRating || rating) ? (
                    <span className="text-yellow-500">★</span>
                  ) : (
                    <span className="text-muted-foreground">☆</span>
                  )}
                </button>
              ))}
            </div>

            <Textarea placeholder="Twoje wrażenia, trwałość, awaryjność…" />
          </div>

          {/* === Zaawansowane === */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Zaawansowane</h4>
            <Input placeholder="Cena zakupu (opcjonalnie)" />
            <Input placeholder="Sklep / źródło" />
            <Textarea placeholder="Prywatne notatki" />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={() => onOpenChange(false)}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
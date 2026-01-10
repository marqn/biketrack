"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { replacePart } from "./actions/replace-part";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { DialogType } from "@/components/bike-header/BikeHeader";

export default function PartCard({
  partName,
  wearKm,
  expectedKm,
  bikeId,
  partType,
  children,
}: {
  partName: string;
  wearKm: number;
  expectedKm: number;
  bikeId: string;
  partType: PartType;
  children?: React.ReactNode;
}) {
  const [activeDialog, setActiveDialog] = React.useState<DialogType>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const progressPercent = Math.min(
    Math.round((wearKm / expectedKm) * 100),
    100
  );

  function handleReplace() {
    const formData = new FormData();
    formData.set("bikeId", bikeId);
    formData.set("partType", partType);

    startTransition(async () => {
      await replacePart(formData);
      router.refresh();
    });
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {partName}
          <p>
            <button
              onClick={() => setActiveDialog("bike-details")}
              className="text-xs text-muted-foreground relative after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full cursor-pointer"
            >
              Shimano GRX 820, 48/31
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

          <Button
            size={"sm"}
            variant="outline"
            onClick={handleReplace}
            disabled={isPending}
          >
            {isPending ? "Wymieniam..." : "🔄 Wymień"}
          </Button>
        </div>
      </CardContent>

      <CardContent className="space-y-3">{children}</CardContent>

      {/* Dialog z poprawkami */}
      <Dialog
        open={activeDialog === "bike-details"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Dodaj część rowerową</DialogTitle>
            <DialogDescription>
              Określ model części oraz jej parametry użytkowe
            </DialogDescription>
          </DialogHeader>

          <div 
            className="custom-scrollbar space-y-6 overflow-y-auto -mx-6 pl-6 pr-8" 
            style={{maxHeight: 'calc(90vh - 200px)'}}
          >
            {/* === Podstawowe informacje === */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Podstawowe informacje</h4>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Typ części" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tire">Opona</SelectItem>
                  <SelectItem value="cassette">Kaseta</SelectItem>
                  <SelectItem value="brake_pads">Klocki hamulcowe</SelectItem>
                </SelectContent>
              </Select>

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

              {/* placeholder pod gwiazdki */}
              <div className="flex gap-1">★ ★ ★ ★ ★</div>

              <Textarea placeholder="Twoje wrażenia, trwałość, awaryjność…" />
            </div>

            {/* === Zaawansowane === */}
            <Collapsible>
              <CollapsibleTrigger className="text-sm text-muted-foreground">
                Zaawansowane
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <Input placeholder="Cena zakupu (opcjonalnie)" />
                <Input placeholder="Sklep / źródło" />
                <Textarea placeholder="Prywatne notatki" />
              </CollapsibleContent>
            </Collapsible>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>
              Anuluj
            </Button>
            <Button onClick={() => setActiveDialog(null)}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
"use client";

import { useState, useTransition } from "react";
import { updateBikeSetup } from "./actions/update-bike-setup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { BrakeType, ForkType } from "@/lib/default-parts";

const LS_KEY = "bikeSetupPanelDismissed";

const BRAKE_OPTIONS: { value: BrakeType; label: string }[] = [
  { value: "disc-hydraulic", label: "Tarczowy hydr." },
  { value: "disc", label: "Tarczowy mech." },
  { value: "rim", label: "Szczękowy" },
  { value: "v-brake", label: "V-Brake" },
];

type Props = {
  bikeId: string;
  initialBrakeType: BrakeType;
  initialForkType: ForkType;
  initialTubelessFront: boolean;
  initialTubelessRear: boolean;
};

export default function BikeSetupPanel({
  bikeId,
  initialBrakeType,
  initialForkType,
  initialTubelessFront,
  initialTubelessRear,
}: Props) {
  const [visible, setVisible] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(LS_KEY) !== "true"
  );
  const [isBrakePending, startBrakeTransition] = useTransition();
  const [isWheelPending, startWheelTransition] = useTransition();
  const isSaving = isBrakePending || isWheelPending;

  const [brakeType, setBrakeType] = useState<BrakeType>(initialBrakeType);
  const [forkType, setForkType] = useState<ForkType>(initialForkType);
  const [tubelessFront, setTubelessFront] = useState(initialTubelessFront);
  const [tubelessRear, setTubelessRear] = useState(initialTubelessRear);

  function handleClose() {
    localStorage.setItem(LS_KEY, "true");
    setVisible(false);
  }

  function saveBrake(newBrakeType: BrakeType) {
    startBrakeTransition(async () => {
      try {
        const result = await updateBikeSetup({
          bikeId,
          brakeType: newBrakeType,
          forkType,
          tubelessFront,
          tubelessRear,
        });
        if (!result.success) toast.error("Nie udało się zapisać ustawień");
        else toast.success("Zapisano");
      } catch {
        toast.error("Nie udało się zapisać ustawień");
      }
    });
  }

  function saveWheels(patch: Partial<{ forkType: ForkType; tubelessFront: boolean; tubelessRear: boolean }>) {
    const next = { forkType, tubelessFront, tubelessRear, ...patch };
    startWheelTransition(async () => {
      try {
        const result = await updateBikeSetup({ bikeId, brakeType, ...next });
        if (!result.success) toast.error("Nie udało się zapisać ustawień");
        else toast.success("Zapisano");
      } catch {
        toast.error("Nie udało się zapisać ustawień");
      }
    });
  }

  function handleBrakeType(value: string) {
    if (!value) return;
    const v = value as BrakeType;
    setBrakeType(v);
    saveBrake(v);
  }

  function handleForkType(value: string) {
    if (!value) return;
    const v = value as ForkType;
    setForkType(v);
    saveWheels({ forkType: v });
  }

  function handleTubelessFront(value: string) {
    if (!value) return;
    const v = value === "true";
    setTubelessFront(v);
    saveWheels({ tubelessFront: v });
  }

  function handleTubelessRear(value: string) {
    if (!value) return;
    const v = value === "true";
    setTubelessRear(v);
    saveWheels({ tubelessRear: v });
  }

  if (!visible) return null;

  return (
    <Card className="mt-4 mx-auto max-w-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex-1" />
        <CardTitle className="text-sm text-center">⚙️ Konfiguracja roweru</CardTitle>
        <div className="flex-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleClose}
            aria-label="Zamknij"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`space-y-4 px-4 pb-4 transition-opacity ${isSaving ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Typ hamulców
          </Label>
          <ToggleGroup
            type="single"
            value={brakeType}
            onValueChange={handleBrakeType}
            className="grid grid-cols-2 gap-1.5"
          >
            {BRAKE_OPTIONS.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
                className="h-10 text-xs rounded-lg"
              >
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Koła i widelec
          </Label>
          <div className="space-y-2">
            <div
              className="flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer select-none"
              onClick={() => handleForkType(forkType === "suspension" ? "rigid" : "suspension")}
            >
              <Label className="text-sm font-normal pointer-events-none">Widelec amortyzowany</Label>
              <ToggleGroup
                type="single"
                value={forkType}
                className="gap-1 pointer-events-none"
              >
                <ToggleGroupItem value="rigid" className="h-8 px-3 text-xs rounded-lg">Sztywny</ToggleGroupItem>
                <ToggleGroupItem value="suspension" className="h-8 px-3 text-xs rounded-lg">Amortyzowany</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div
              className="flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer select-none"
              onClick={() => handleTubelessFront(String(!tubelessFront))}
            >
              <Label className="text-sm font-normal pointer-events-none">Tubeless — przód</Label>
              <ToggleGroup
                type="single"
                value={String(tubelessFront)}
                className="gap-1 pointer-events-none"
              >
                <ToggleGroupItem value="false" className="h-8 px-3 text-xs rounded-lg">Nie</ToggleGroupItem>
                <ToggleGroupItem value="true" className="h-8 px-3 text-xs rounded-lg">Tak</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div
              className="flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer select-none"
              onClick={() => handleTubelessRear(String(!tubelessRear))}
            >
              <Label className="text-sm font-normal pointer-events-none">Tubeless — tył</Label>
              <ToggleGroup
                type="single"
                value={String(tubelessRear)}
                className="gap-1 pointer-events-none"
              >
                <ToggleGroupItem value="false" className="h-8 px-3 text-xs rounded-lg">Nie</ToggleGroupItem>
                <ToggleGroupItem value="true" className="h-8 px-3 text-xs rounded-lg">Tak</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

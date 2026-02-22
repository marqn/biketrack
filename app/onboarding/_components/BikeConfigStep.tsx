"use client";

import { ArrowLeft, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { BrakeType } from "@/lib/default-parts";

const BRAKE_OPTIONS: { value: BrakeType; label: string }[] = [
  { value: "disc-hydraulic", label: "Tarczowy hydrauliczny" },
  { value: "disc", label: "Tarczowy mechaniczny" },
  { value: "rim", label: "Szczękowy" },
  { value: "v-brake", label: "V-Brake" },
];

interface BikeConfigStepProps {
  brakeType: BrakeType;
  hasSuspensionFork: boolean;
  tubelessFront: boolean;
  tubelessRear: boolean;
  isElectric: boolean;
  onBrakeTypeChange: (value: BrakeType) => void;
  onSuspensionForkChange: (value: boolean) => void;
  onTubelessFrontChange: (value: boolean) => void;
  onTubelessRearChange: (value: boolean) => void;
  onIsElectricChange: (value: boolean) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function BikeConfigStep({
  brakeType,
  hasSuspensionFork,
  tubelessFront,
  tubelessRear,
  isElectric,
  onBrakeTypeChange,
  onSuspensionForkChange,
  onTubelessFrontChange,
  onTubelessRearChange,
  onIsElectricChange,
  onNext,
  onSkip,
  onBack,
}: BikeConfigStepProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Wróć do szczegółów
      </button>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Typ hamulców</Label>
        <ToggleGroup
          type="single"
          value={brakeType}
          onValueChange={(v) => { if (v) onBrakeTypeChange(v as BrakeType); }}
          className="grid grid-cols-2 gap-2"
        >
          {BRAKE_OPTIONS.map((opt) => (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              className="h-14 text-sm rounded-xl text-center px-2"
            >
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-3 pt-1">
        <div
          className="flex items-center justify-between rounded-lg border p-3 cursor-pointer select-none"
          onClick={() => onSuspensionForkChange(!hasSuspensionFork)}
        >
          <Label className="text-sm pointer-events-none">Widelec amortyzowany</Label>
          <ToggleGroup type="single" value={hasSuspensionFork ? "yes" : "no"} className="gap-1 pointer-events-none">
            <ToggleGroupItem value="no" className="h-8 px-3 text-xs rounded-lg">Nie</ToggleGroupItem>
            <ToggleGroupItem value="yes" className="h-8 px-3 text-xs rounded-lg">Tak</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div
          className="flex items-center justify-between rounded-lg border p-3 cursor-pointer select-none"
          onClick={() => onTubelessFrontChange(!tubelessFront)}
        >
          <Label className="text-sm pointer-events-none">Opona tubeless — przód</Label>
          <ToggleGroup type="single" value={tubelessFront ? "yes" : "no"} className="gap-1 pointer-events-none">
            <ToggleGroupItem value="no" className="h-8 px-3 text-xs rounded-lg">Nie</ToggleGroupItem>
            <ToggleGroupItem value="yes" className="h-8 px-3 text-xs rounded-lg">Tak</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div
          className="flex items-center justify-between rounded-lg border p-3 cursor-pointer select-none"
          onClick={() => onTubelessRearChange(!tubelessRear)}
        >
          <Label className="text-sm pointer-events-none">Opona tubeless — tył</Label>
          <ToggleGroup type="single" value={tubelessRear ? "yes" : "no"} className="gap-1 pointer-events-none">
            <ToggleGroupItem value="no" className="h-8 px-3 text-xs rounded-lg">Nie</ToggleGroupItem>
            <ToggleGroupItem value="yes" className="h-8 px-3 text-xs rounded-lg">Tak</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div
          className="flex items-center justify-between rounded-lg border p-3 cursor-pointer select-none"
          onClick={() => onIsElectricChange(!isElectric)}
        >
          <Label className="text-sm flex items-center gap-2 pointer-events-none">
            <ZapIcon className="h-4 w-4 text-blue-500" />
            Rower elektryczny (e-bike)
          </Label>
          <ToggleGroup type="single" value={isElectric ? "yes" : "no"} className="gap-1 pointer-events-none">
            <ToggleGroupItem value="no" className="h-8 px-3 text-xs rounded-lg">Nie</ToggleGroupItem>
            <ToggleGroupItem value="yes" className="h-8 px-3 text-xs rounded-lg">Tak</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Button onClick={onNext} className="w-full" size="lg">
          Dalej
        </Button>
        <Button onClick={onSkip} variant="outline" className="w-full" size="lg">
          Pomiń
        </Button>
      </div>
    </>
  );
}

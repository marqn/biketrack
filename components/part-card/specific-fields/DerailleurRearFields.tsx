"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DerailleurRearSpecificData } from "@/lib/part-specific-data";

interface DerailleurRearFieldsProps {
  data: Partial<DerailleurRearSpecificData>;
  onChange: (data: Partial<DerailleurRearSpecificData>) => void;
}

const SPEEDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const DERAILLEUR_TYPES: { value: DerailleurRearSpecificData["derailleurType"]; label: string }[] = [
  { value: "mechanical", label: "Mechaniczna" },
  { value: "electronic", label: "Elektryczna" },
  { value: "wireless", label: "Bezprzewodowa" },
];

const DRIVETRAINS = [
  "1x7", "1x8", "1x9", "1x10", "1x11", "1x12", "1x13",
  "2x6", "2x7", "2x8", "2x9", "2x10", "2x11", "2x12",
  "3x6", "3x7", "3x8", "3x9", "3x10",
];

export default function DerailleurRearFields({
  data,
  onChange,
}: DerailleurRearFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja przerzutki tylnej</h4>

      <div className="space-y-2">
        <Label htmlFor="derailleur-speeds">Liczba rzędów</Label>
        <Select
          value={data.speeds?.toString() || ""}
          onValueChange={(value) =>
            onChange({ ...data, speeds: Number(value) as DerailleurRearSpecificData["speeds"] })
          }
        >
          <SelectTrigger id="derailleur-speeds">
            <SelectValue placeholder="Wybierz liczbę rzędów" />
          </SelectTrigger>
          <SelectContent>
            {SPEEDS.map((speed) => (
              <SelectItem key={speed} value={speed.toString()}>
                {speed}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="derailleur-type">Typ przerzutki</Label>
        <Select
          value={data.derailleurType || ""}
          onValueChange={(value) =>
            onChange({ ...data, derailleurType: value as DerailleurRearSpecificData["derailleurType"] })
          }
        >
          <SelectTrigger id="derailleur-type">
            <SelectValue placeholder="Wybierz typ" />
          </SelectTrigger>
          <SelectContent>
            {DERAILLEUR_TYPES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="derailleur-drivetrain">Napęd</Label>
        <Select
          value={data.drivetrain || ""}
          onValueChange={(value) => onChange({ ...data, drivetrain: value })}
        >
          <SelectTrigger id="derailleur-drivetrain">
            <SelectValue placeholder="Wybierz napęd" />
          </SelectTrigger>
          <SelectContent>
            {DRIVETRAINS.map((dt) => (
              <SelectItem key={dt} value={dt}>
                {dt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

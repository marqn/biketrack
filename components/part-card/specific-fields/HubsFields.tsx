"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HubsSpecificData } from "@/lib/part-specific-data";

interface HubsFieldsProps {
  data: Partial<HubsSpecificData>;
  onChange: (data: Partial<HubsSpecificData>) => void;
}

const DISC_MOUNTS = [
  { value: "centerlock", label: "Centerlock" },
  { value: "6-bolt", label: "6 śrub" },
  { value: "none", label: "Nie" },
];

const BEARINGS = [
  { value: "loose-ball", label: "Kulkowe" },
  { value: "cartridge", label: "Maszynowe" },
];

const HOLES = [
  { value: "24", label: "24" },
  { value: "28", label: "28" },
  { value: "32", label: "32" },
  { value: "36", label: "36" },
];

export default function HubsFields({ data, onChange }: HubsFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hubs-disc-mount">Mocowanie tarczy</Label>
        <Select
          value={data.discMount || ""}
          onValueChange={(value) =>
            onChange({ ...data, discMount: value as HubsSpecificData["discMount"] })
          }
        >
          <SelectTrigger id="hubs-disc-mount">
            <SelectValue placeholder="Wybierz mocowanie" />
          </SelectTrigger>
          <SelectContent>
            {DISC_MOUNTS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hubs-bearings">Łożyska</Label>
        <Select
          value={data.bearings || ""}
          onValueChange={(value) =>
            onChange({ ...data, bearings: value as HubsSpecificData["bearings"] })
          }
        >
          <SelectTrigger id="hubs-bearings">
            <SelectValue placeholder="Wybierz typ łożysk" />
          </SelectTrigger>
          <SelectContent>
            {BEARINGS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hubs-holes">Liczba otworów</Label>
        <Select
          value={data.holes?.toString() || ""}
          onValueChange={(value) =>
            onChange({ ...data, holes: Number(value) as HubsSpecificData["holes"] })
          }
        >
          <SelectTrigger id="hubs-holes">
            <SelectValue placeholder="Wybierz liczbę otworów" />
          </SelectTrigger>
          <SelectContent>
            {HOLES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

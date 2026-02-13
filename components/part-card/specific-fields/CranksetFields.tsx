"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CranksetSpecificData } from "@/lib/part-specific-data";

interface CranksetFieldsProps {
  data: Partial<CranksetSpecificData>;
  onChange: (data: Partial<CranksetSpecificData>) => void;
}

const CHAINRINGS = [
  { value: "28", label: "28T" },
  { value: "30", label: "30T" },
  { value: "32", label: "32T" },
  { value: "34", label: "34T" },
  { value: "36", label: "36T" },
  { value: "38", label: "38T" },
  { value: "39", label: "39T" },
  { value: "40", label: "40T" },
  { value: "42", label: "42T" },
  { value: "46", label: "46T" },
  { value: "48", label: "48T" },
];

const LENGTHS = [
  { value: "160", label: "160 mm" },
  { value: "165", label: "165 mm" },
  { value: "167.5", label: "167.5 mm" },
  { value: "170", label: "170 mm" },
  { value: "172.5", label: "172.5 mm" },
  { value: "175", label: "175 mm" },
  { value: "177.5", label: "177.5 mm" },
];

export default function CranksetFields({ data, onChange }: CranksetFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crankset-chainring">Stopniowanie</Label>
        <Select
          value={data.chainring?.toString() || ""}
          onValueChange={(value) =>
            onChange({ ...data, chainring: Number(value) as CranksetSpecificData["chainring"] })
          }
        >
          <SelectTrigger id="crankset-chainring">
            <SelectValue placeholder="Wybierz liczbę zębów" />
          </SelectTrigger>
          <SelectContent>
            {CHAINRINGS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="crankset-length">Długość</Label>
        <Select
          value={data.length || ""}
          onValueChange={(value) =>
            onChange({ ...data, length: value as CranksetSpecificData["length"] })
          }
        >
          <SelectTrigger id="crankset-length">
            <SelectValue placeholder="Wybierz długość" />
          </SelectTrigger>
          <SelectContent>
            {LENGTHS.map((item) => (
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

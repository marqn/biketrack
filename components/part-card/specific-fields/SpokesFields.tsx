"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpokesSpecificData } from "@/lib/part-specific-data";

interface SpokesFieldsProps {
  data: Partial<SpokesSpecificData>;
  onChange: (data: Partial<SpokesSpecificData>) => void;
}

const MATERIALS = [
  { value: "aluminum", label: "Aluminium" },
  { value: "brass", label: "Mosiądz" },
  { value: "stainless-steel", label: "Stal nierdzewna" },
];

export default function SpokesFields({ data, onChange }: SpokesFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="spokes-material">Materiał</Label>
        <Select
          value={data.material || ""}
          onValueChange={(value) =>
            onChange({ ...data, material: value as SpokesSpecificData["material"] })
          }
        >
          <SelectTrigger id="spokes-material">
            <SelectValue placeholder="Wybierz materiał" />
          </SelectTrigger>
          <SelectContent>
            {MATERIALS.map((mat) => (
              <SelectItem key={mat.value} value={mat.value}>
                {mat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

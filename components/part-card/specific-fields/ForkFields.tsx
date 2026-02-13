"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ForkSpecificData } from "@/lib/part-specific-data";

interface ForkFieldsProps {
  data: Partial<ForkSpecificData>;
  onChange: (data: Partial<ForkSpecificData>) => void;
}

const WHEEL_SIZES = [
  { value: "20", label: '20"' },
  { value: "26", label: '26"' },
  { value: "27.5", label: '27.5"' },
  { value: "28", label: '28"' },
  { value: "29", label: '29"' },
];

const MATERIALS = [
  { value: "aluminum", label: "Aluminium" },
  { value: "steel", label: "Stal" },
  { value: "carbon", label: "Carbon" },
  { value: "titanium", label: "Tytan" },
];

export default function ForkFields({ data, onChange }: ForkFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fork-wheel-size">Rozmiar koła</Label>
        <Select
          value={data.wheelSize || ""}
          onValueChange={(value) =>
            onChange({ ...data, wheelSize: value as ForkSpecificData["wheelSize"] })
          }
        >
          <SelectTrigger id="fork-wheel-size">
            <SelectValue placeholder="Wybierz rozmiar" />
          </SelectTrigger>
          <SelectContent>
            {WHEEL_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fork-material">Materiał</Label>
        <Select
          value={data.material || ""}
          onValueChange={(value) =>
            onChange({ ...data, material: value as ForkSpecificData["material"] })
          }
        >
          <SelectTrigger id="fork-material">
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

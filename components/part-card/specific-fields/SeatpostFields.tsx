"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeatpostSpecificData } from "@/lib/part-specific-data";

interface SeatpostFieldsProps {
  data: Partial<SeatpostSpecificData>;
  onChange: (data: Partial<SeatpostSpecificData>) => void;
}

const MATERIALS = [
  { value: "aluminum", label: "Aluminium" },
  { value: "carbon", label: "Carbon" },
];

export default function SeatpostFields({ data, onChange }: SeatpostFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja sztycy</h4>

      <div className="space-y-2">
        <Label htmlFor="seatpost-material">Materiał</Label>
        <Select
          value={data.material || ""}
          onValueChange={(value) =>
            onChange({ ...data, material: value as SeatpostSpecificData["material"] })
          }
        >
          <SelectTrigger id="seatpost-material">
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

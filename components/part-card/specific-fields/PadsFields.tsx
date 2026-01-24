"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PadsSpecificData } from "@/lib/part-specific-data";

interface PadsFieldsProps {
  data: Partial<PadsSpecificData>;
  onChange: (data: Partial<PadsSpecificData>) => void;
}

export default function PadsFields({ data, onChange }: PadsFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja klocków</h4>

      <div className="space-y-2">
        <Label htmlFor="pads-material">Materiał</Label>
        <Select
          value={data.material || "organic"}
          onValueChange={(value) =>
            onChange({
              ...data,
              material: value as "organic" | "metallic" | "semi-metallic",
            })
          }
        >
          <SelectTrigger id="pads-material">
            <SelectValue placeholder="Wybierz materiał" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="organic">Organiczne</SelectItem>
            <SelectItem value="metallic">Metaliczne</SelectItem>
            <SelectItem value="semi-metallic">Półmetaliczne</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

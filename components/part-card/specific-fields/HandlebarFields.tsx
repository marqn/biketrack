"use client";

import { Label } from "@/components/ui/label";
import NumberStepper from "@/components/ui/number-stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HandlebarSpecificData } from "@/lib/part-specific-data";

interface HandlebarFieldsProps {
  data: Partial<HandlebarSpecificData>;
  onChange: (data: Partial<HandlebarSpecificData>) => void;
}

export default function HandlebarFields({ data, onChange }: HandlebarFieldsProps) {
  const width = data.width || 420;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="handlebar-material">Materiał</Label>
        <Select
          value={data.material || "aluminum"}
          onValueChange={(value) =>
            onChange({
              ...data,
              material: value as HandlebarSpecificData["material"],
            })
          }
        >
          <SelectTrigger id="handlebar-material">
            <SelectValue placeholder="Wybierz materiał" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aluminum">Aluminium</SelectItem>
            <SelectItem value="carbon">Carbon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Szerokość (mm)</Label>
        <NumberStepper
          value={width}
          onChange={(v) => onChange({ ...data, width: v })}
          steps={[10]}
          min={400}
          max={750}
        />
      </div>
    </div>
  );
}

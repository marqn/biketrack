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
import { StemSpecificData } from "@/lib/part-specific-data";

interface StemFieldsProps {
  data: Partial<StemSpecificData>;
  onChange: (data: Partial<StemSpecificData>) => void;
}

export default function StemFields({ data, onChange }: StemFieldsProps) {
  const length = data.length || 90;
  const angle = data.angle || 6;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Długość (mm)</Label>
        <NumberStepper
          value={length}
          onChange={(v) => onChange({ ...data, length: v })}
          steps={[10]}
          min={30}
          max={150}
        />
      </div>

      <div className="space-y-2">
        <Label>Kąt nachylenia (°)</Label>
        <NumberStepper
          value={angle}
          onChange={(v) => onChange({ ...data, angle: v })}
          steps={[1]}
          min={0}
          max={90}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stem-material">Materiał</Label>
        <Select
          value={data.material || "aluminum"}
          onValueChange={(value) =>
            onChange({
              ...data,
              material: value as StemSpecificData["material"],
            })
          }
        >
          <SelectTrigger id="stem-material">
            <SelectValue placeholder="Wybierz materiał" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aluminum">Aluminium</SelectItem>
            <SelectItem value="carbon">Carbon</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

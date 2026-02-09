"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
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

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja mostka</h4>

      <div className="space-y-2">
        <Label htmlFor="stem-length">Długość (mm)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, length: clamp(length - 10, 30, 150) })}
            disabled={length <= 30}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="stem-length"
            type="number"
            min={30}
            max={150}
            value={length}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (num) onChange({ ...data, length: clamp(num, 30, 150) });
            }}
            className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, length: clamp(length + 10, 30, 150) })}
            disabled={length >= 150}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stem-angle">Kąt nachylenia (°)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, angle: clamp(angle - 1, 0, 90) })}
            disabled={angle <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="stem-angle"
            type="number"
            min={0}
            max={90}
            value={angle}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (!isNaN(num)) onChange({ ...data, angle: clamp(num, 0, 90) });
            }}
            className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, angle: clamp(angle + 1, 0, 90) })}
            disabled={angle >= 90}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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

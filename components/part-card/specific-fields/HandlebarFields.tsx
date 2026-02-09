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
import { HandlebarSpecificData } from "@/lib/part-specific-data";

interface HandlebarFieldsProps {
  data: Partial<HandlebarSpecificData>;
  onChange: (data: Partial<HandlebarSpecificData>) => void;
}

export default function HandlebarFields({ data, onChange }: HandlebarFieldsProps) {
  const width = data.width || 420;

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja kierownicy</h4>

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
        <Label htmlFor="handlebar-width">Szerokość (mm)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, width: clamp(width - 10, 400, 750) })}
            disabled={width <= 400}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="handlebar-width"
            type="number"
            min={400}
            max={750}
            value={width}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (num) onChange({ ...data, width: clamp(num, 400, 750) });
            }}
            className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, width: clamp(width + 10, 400, 750) })}
            disabled={width >= 750}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

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
import { HandlebarTapeSpecificData } from "@/lib/part-specific-data";

interface HandlebarTapeFieldsProps {
  data: Partial<HandlebarTapeSpecificData>;
  onChange: (data: Partial<HandlebarTapeSpecificData>) => void;
}

export default function HandlebarTapeFields({ data, onChange }: HandlebarTapeFieldsProps) {
  const thickness = data.thickness || 2.5;

  const clamp = (val: number, min: number, max: number) =>
    Math.round(Math.max(min, Math.min(max, val)) * 10) / 10;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tape-material">Materiał</Label>
        <Select
          value={data.material || "eva"}
          onValueChange={(value) =>
            onChange({
              ...data,
              material: value as HandlebarTapeSpecificData["material"],
            })
          }
        >
          <SelectTrigger id="tape-material">
            <SelectValue placeholder="Wybierz materiał" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="velvet">Velvet</SelectItem>
            <SelectItem value="eva">EVA</SelectItem>
            <SelectItem value="kraton">Kraton</SelectItem>
            <SelectItem value="cork">Korek</SelectItem>
            <SelectItem value="rubber">Guma</SelectItem>
            <SelectItem value="foam">Pianka</SelectItem>
            <SelectItem value="polyurethane">Poliuretan</SelectItem>
            <SelectItem value="silicone">Silikon</SelectItem>
            <SelectItem value="leather">Skóra</SelectItem>
            <SelectItem value="solocush">Solocush</SelectItem>
            <SelectItem value="synthetic-leather">Skóra syntetyczna</SelectItem>
            <SelectItem value="gel">Żel</SelectItem>
            <SelectItem value="nylon">Nylon</SelectItem>
            <SelectItem value="organic-cotton">Bawełna organiczna</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tape-thickness">Grubość (mm)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, thickness: clamp(thickness - 0.1, 1.5, 4.5) })}
            disabled={thickness <= 1.5}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="tape-thickness"
            type="number"
            min={1.5}
            max={4.5}
            step={0.1}
            value={thickness}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (num) onChange({ ...data, thickness: clamp(num, 1.5, 4.5) });
            }}
            className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, thickness: clamp(thickness + 0.1, 1.5, 4.5) })}
            disabled={thickness >= 4.5}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

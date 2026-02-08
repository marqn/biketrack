"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { ChainSpecificData } from "@/lib/part-specific-data";

interface ChainFieldsProps {
  data: Partial<ChainSpecificData>;
  onChange: (data: Partial<ChainSpecificData>) => void;
}

export default function ChainFields({ data, onChange }: ChainFieldsProps) {
  const value = data.speeds || 0;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja łańcucha</h4>

      <div className="space-y-2">
        <Label htmlFor="chain-speeds">Liczba rzędów</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, speeds: Math.max(1, value - 1) })}
            disabled={value <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="chain-speeds"
            type="number"
            placeholder="1"
            value={value || ""}
            onChange={(e) =>
              onChange({ ...data, speeds: Math.max(1, Number(e.target.value) || 1) })
            }
            className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, speeds: value + 1 })}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Np. 1 dla singlespeed, 2 lub 3 dla wielorzędowych
        </p>
      </div>
    </div>
  );
}

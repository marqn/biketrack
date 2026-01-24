"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChainSpecificData } from "@/lib/part-specific-data";

interface ChainFieldsProps {
  data: Partial<ChainSpecificData>;
  onChange: (data: Partial<ChainSpecificData>) => void;
}

export default function ChainFields({ data, onChange }: ChainFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja łańcucha</h4>

      <div className="space-y-2">
        <Label htmlFor="chain-speeds">Liczba biegów</Label>
        <Input
          id="chain-speeds"
          type="number"
          placeholder="11"
          value={data.speeds || ""}
          onChange={(e) =>
            onChange({ ...data, speeds: Number(e.target.value) || 11 })
          }
        />
        <p className="text-xs text-muted-foreground">
          Np. 10, 11, 12 (liczba zębatek z tyłu)
        </p>
      </div>
    </div>
  );
}

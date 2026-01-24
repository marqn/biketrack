"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TireSpecificData } from "@/lib/part-specific-data";

interface TireFieldsProps {
  data: Partial<TireSpecificData>;
  onChange: (data: Partial<TireSpecificData>) => void;
}

export default function TireFields({ data, onChange }: TireFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja opony</h4>

      <div className="space-y-2">
        <Label htmlFor="tire-width">Szerokość (mm)</Label>
        <Input
          id="tire-width"
          type="number"
          placeholder="28"
          value={data.width || ""}
          onChange={(e) =>
            onChange({ ...data, width: Number(e.target.value) || 28 })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tire-size">Rozmiar (700, 650, 29)</Label>
        <Input
          id="tire-size"
          type="number"
          placeholder="700"
          value={data.size || ""}
          onChange={(e) =>
            onChange({ ...data, size: Number(e.target.value) || 700 })
          }
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="tire-tubeless"
          checked={data.tubeless || false}
          onCheckedChange={(checked) =>
            onChange({ ...data, tubeless: checked === true })
          }
        />
        <Label
          htmlFor="tire-tubeless"
          className="text-sm font-normal cursor-pointer"
        >
          Tubeless
        </Label>
      </div>
    </div>
  );
}

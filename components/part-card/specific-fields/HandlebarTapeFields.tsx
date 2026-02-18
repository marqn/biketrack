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
import { HandlebarTapeSpecificData } from "@/lib/part-specific-data";

interface HandlebarTapeFieldsProps {
  data: Partial<HandlebarTapeSpecificData>;
  onChange: (data: Partial<HandlebarTapeSpecificData>) => void;
}

export default function HandlebarTapeFields({ data, onChange }: HandlebarTapeFieldsProps) {
  const thickness = data.thickness || 2.5;

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
        <Label>Grubość (mm)</Label>
        <NumberStepper
          value={thickness}
          onChange={(v) => onChange({ ...data, thickness: Math.round(v * 10) / 10 })}
          steps={[0.1]}
          min={1.5}
          max={4.5}
        />
      </div>
    </div>
  );
}

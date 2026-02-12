"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShiftersSpecificData } from "@/lib/part-specific-data";

interface ShiftersFieldsProps {
  data: Partial<ShiftersSpecificData>;
  onChange: (data: Partial<ShiftersSpecificData>) => void;
  showClassicOption?: boolean;
}

export default function ShiftersFields({ data, onChange, showClassicOption }: ShiftersFieldsProps) {
  if (!showClassicOption) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja manetek</h4>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="classic-shifter"
          checked={data.isClassicShifter || false}
          onCheckedChange={(checked) =>
            onChange({ ...data, isClassicShifter: checked === true })
          }
        />
        <Label
          htmlFor="classic-shifter"
          className="text-sm font-normal cursor-pointer"
        >
          Klasyczna manetka (nie klamkomanetka)
        </Label>
      </div>
    </div>
  );
}

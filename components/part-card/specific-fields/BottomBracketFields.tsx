"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BottomBracketSpecificData } from "@/lib/part-specific-data";

interface BottomBracketFieldsProps {
  data: Partial<BottomBracketSpecificData>;
  onChange: (data: Partial<BottomBracketSpecificData>) => void;
}

const SHELL_TYPES = [
  { value: "square", label: "Kwadrat" },
  { value: "bsa", label: "BSA" },
  { value: "ita", label: "ITA" },
  { value: "t47", label: "T47" },
  { value: "press-fit", label: "Press Fit" },
];

export default function BottomBracketFields({ data, onChange }: BottomBracketFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bb-shell-type">Typ mufy ramy</Label>
        <Select
          value={data.shellType || ""}
          onValueChange={(value) =>
            onChange({ ...data, shellType: value as BottomBracketSpecificData["shellType"] })
          }
        >
          <SelectTrigger id="bb-shell-type">
            <SelectValue placeholder="Wybierz typ mufy" />
          </SelectTrigger>
          <SelectContent>
            {SHELL_TYPES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

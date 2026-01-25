"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LubricantSpecificData } from "@/lib/part-specific-data";

interface LubricantFieldsProps {
  data: Partial<LubricantSpecificData>;
  onChange: (data: Partial<LubricantSpecificData>) => void;
}

export default function LubricantFields({
  data,
  onChange,
}: LubricantFieldsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="lubricant-type">Rodzaj</Label>
      <Select
        value={data.lubricantType || "oil"}
        onValueChange={(value) =>
          onChange({
            ...data,
            lubricantType: value as "wax" | "oil",
          })
        }
      >
        <SelectTrigger id="lubricant-type">
          <SelectValue placeholder="Wybierz rodzaj" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="oil">Smar (olej)</SelectItem>
          <SelectItem value="wax">Wosk</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

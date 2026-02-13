"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HeadsetSpecificData } from "@/lib/part-specific-data";

interface HeadsetFieldsProps {
  data: Partial<HeadsetSpecificData>;
  onChange: (data: Partial<HeadsetSpecificData>) => void;
}

export default function HeadsetFields({ data, onChange }: HeadsetFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="headset-bearings">Łożyska</Label>
        <Select
          value={data.bearings || "cartridge"}
          onValueChange={(value) =>
            onChange({
              ...data,
              bearings: value as HeadsetSpecificData["bearings"],
            })
          }
        >
          <SelectTrigger id="headset-bearings">
            <SelectValue placeholder="Wybierz łożyska" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loose-ball">Kulkowe</SelectItem>
            <SelectItem value="cartridge">Maszynowe</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

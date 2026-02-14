"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrakeCaliperSpecificData } from "@/lib/part-specific-data";

interface BrakeCaliperFieldsProps {
  data: Partial<BrakeCaliperSpecificData>;
  onChange: (data: Partial<BrakeCaliperSpecificData>) => void;
}

export default function BrakeCaliperFields({ data, onChange }: BrakeCaliperFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pistons-count">Liczba tłoczków</Label>
        <Select
          value={String(data.pistons || 2)}
          onValueChange={(value) =>
            onChange({
              ...data,
              pistons: Number(value) as BrakeCaliperSpecificData["pistons"],
            })
          }
        >
          <SelectTrigger id="pistons-count">
            <SelectValue placeholder="Wybierz liczbę tłoczków" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 tłoczek</SelectItem>
            <SelectItem value="2">2 tłoczki</SelectItem>
            <SelectItem value="3">3 tłoczki</SelectItem>
            <SelectItem value="4">4 tłoczki</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

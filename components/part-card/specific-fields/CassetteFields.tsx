"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CassetteSpecificData } from "@/lib/part-specific-data";

interface CassetteFieldsProps {
  data: Partial<CassetteSpecificData>;
  onChange: (data: Partial<CassetteSpecificData>) => void;
}

export default function CassetteFields({
  data,
  onChange,
}: CassetteFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja kasety</h4>

      <div className="space-y-2">
        <Label htmlFor="cassette-range">Zakres przełożeń</Label>
        <Input
          id="cassette-range"
          type="text"
          placeholder="11-34"
          value={data.range || ""}
          onChange={(e) => onChange({ ...data, range: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Np. 11-34, 10-52, 11-28
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cassette-speeds">Liczba biegów</Label>
        <Input
          id="cassette-speeds"
          type="number"
          placeholder="11"
          value={data.speeds || ""}
          onChange={(e) =>
            onChange({ ...data, speeds: Number(e.target.value) || 11 })
          }
        />
      </div>
    </div>
  );
}

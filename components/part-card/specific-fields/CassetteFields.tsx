"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CassetteSpecificData } from "@/lib/part-specific-data";

interface CassetteFieldsProps {
  data: Partial<CassetteSpecificData>;
  onChange: (data: Partial<CassetteSpecificData>) => void;
}

const CASSETTE_RANGE_MAP: Record<number, number[]> = {
  9: [42, 45],
  10: [24, 28, 30, 33, 36, 42, 44, 45, 46, 48, 50, 51, 52],
  11: [23, 25, 26, 28, 30, 32, 34, 36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 48, 50, 51, 52],
  12: [23, 25, 26, 27, 28, 29, 32, 36, 42, 46],
  13: [26, 29],
  14: [25, 28],
};

const CASSETTE_SPEEDS = [1, 7, 8, 9, 10, 11, 12, 13];

export default function CassetteFields({
  data,
  onChange,
}: CassetteFieldsProps) {
  const [minStr, maxStr] = (data.range || "").split("-");
  const minSprocket = minStr ? Number(minStr) : undefined;
  const maxSprocket = maxStr ? Number(maxStr) : undefined;

  const availableMax = minSprocket ? CASSETTE_RANGE_MAP[minSprocket] || [] : [];

  const handleMinChange = (value: string) => {
    const newMin = Number(value);
    const newMaxOptions = CASSETTE_RANGE_MAP[newMin] || [];
    if (maxSprocket && newMaxOptions.includes(maxSprocket)) {
      onChange({ ...data, range: `${newMin}-${maxSprocket}` });
    } else {
      onChange({ ...data, range: `${newMin}-` });
    }
  };

  const handleMaxChange = (value: string) => {
    onChange({ ...data, range: `${minSprocket}-${value}` });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cassette-speeds">Liczba rzędów</Label>
        <Select
          value={data.speeds?.toString() || ""}
          onValueChange={(value) =>
            onChange({ ...data, speeds: Number(value) as CassetteSpecificData["speeds"] })
          }
        >
          <SelectTrigger id="cassette-speeds">
            <SelectValue placeholder="Wybierz liczbę rzędów" />
          </SelectTrigger>
          <SelectContent>
            {CASSETTE_SPEEDS.map((speed) => (
              <SelectItem key={speed} value={speed.toString()}>
                {speed}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Stopniowanie</Label>
        <div className="flex gap-2 items-center">
          <Select
            value={minSprocket?.toString() || ""}
            onValueChange={handleMinChange}
          >
            <SelectTrigger id="cassette-min">
              <SelectValue placeholder="Od" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CASSETTE_RANGE_MAP).map((min) => (
                <SelectItem key={min} value={min}>
                  {min}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">-</span>
          <Select
            value={maxSprocket?.toString() || ""}
            onValueChange={handleMaxChange}
            disabled={!minSprocket}
          >
            <SelectTrigger id="cassette-max">
              <SelectValue placeholder="Do" />
            </SelectTrigger>
            <SelectContent>
              {availableMax.map((max) => (
                <SelectItem key={max} value={max.toString()}>
                  {max}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

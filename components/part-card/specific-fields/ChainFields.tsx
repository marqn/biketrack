"use client";

import { Label } from "@/components/ui/label";
import NumberStepper from "@/components/ui/number-stepper";
import { ChainSpecificData } from "@/lib/part-specific-data";

interface ChainFieldsProps {
  data: Partial<ChainSpecificData>;
  onChange: (data: Partial<ChainSpecificData>) => void;
}

const CHAIN_SPEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

export default function ChainFields({ data, onChange }: ChainFieldsProps) {
  const speeds = data.speeds || 1;

  const handleChange = (v: number) => {
    // Valid speed — use directly (handles direct input of valid values)
    if ((CHAIN_SPEEDS as readonly number[]).includes(v)) {
      onChange({ ...data, speeds: v as ChainSpecificData["speeds"] });
      return;
    }

    // Small change (button press, step=1) — jump to next/prev valid speed
    if (Math.abs(v - speeds) <= 1) {
      if (v > speeds) {
        const next = CHAIN_SPEEDS.find((s) => s > speeds);
        if (next !== undefined) onChange({ ...data, speeds: next });
      } else if (v < speeds) {
        const prev = [...CHAIN_SPEEDS].reverse().find((s) => s < speeds);
        if (prev !== undefined) onChange({ ...data, speeds: prev });
      }
      return;
    }

    // Large change (direct input of invalid value) — snap to nearest
    const closest = CHAIN_SPEEDS.reduce((p, c) =>
      Math.abs(c - v) < Math.abs(p - v) ? c : p,
    );
    onChange({ ...data, speeds: closest });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Liczba rzędów</Label>
        <NumberStepper
          className="px-32"
          value={speeds}
          onChange={handleChange}
          steps={[1]}
          min={1}
          max={13}
        />
      </div>
    </div>
  );
}

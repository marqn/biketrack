"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { ChainSpecificData } from "@/lib/part-specific-data";

interface ChainFieldsProps {
  data: Partial<ChainSpecificData>;
  onChange: (data: Partial<ChainSpecificData>) => void;
}

const CHAIN_SPEEDS = [1, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

export default function ChainFields({ data, onChange }: ChainFieldsProps) {
  const value = data.speeds || 0;
  const currentIndex = CHAIN_SPEEDS.indexOf(value as typeof CHAIN_SPEEDS[number]);

  const handleDecrement = () => {
    if (currentIndex > 0) {
      onChange({ ...data, speeds: CHAIN_SPEEDS[currentIndex - 1] });
    } else if (currentIndex === -1) {
      const closest = CHAIN_SPEEDS.findLast((s) => s < value) ?? CHAIN_SPEEDS[0];
      onChange({ ...data, speeds: closest });
    }
  };

  const handleIncrement = () => {
    if (currentIndex >= 0 && currentIndex < CHAIN_SPEEDS.length - 1) {
      onChange({ ...data, speeds: CHAIN_SPEEDS[currentIndex + 1] });
    } else if (currentIndex === -1) {
      const closest = CHAIN_SPEEDS.find((s) => s > value) ?? CHAIN_SPEEDS[CHAIN_SPEEDS.length - 1];
      onChange({ ...data, speeds: closest });
    }
  };

  const handleInputChange = (raw: string) => {
    const num = Number(raw);
    if (!num) return;
    const closest = CHAIN_SPEEDS.reduce((prev, curr) =>
      Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
    );
    onChange({ ...data, speeds: closest });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja łańcucha</h4>

      <div className="space-y-2">
        <Label htmlFor="chain-speeds">Liczba rzędów</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={handleDecrement}
            disabled={currentIndex === 0 || (currentIndex === -1 && value <= CHAIN_SPEEDS[0])}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="chain-speeds"
            type="number"
            placeholder="1"
            value={value || ""}
            onChange={(e) => handleInputChange(e.target.value)}
            className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={handleIncrement}
            disabled={currentIndex === CHAIN_SPEEDS.length - 1}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RimsSpecificData } from "@/lib/part-specific-data";

interface RimsFieldsProps {
  data: Partial<RimsSpecificData>;
  onChange: (data: Partial<RimsSpecificData>) => void;
}

export default function RimsFields({ data, onChange }: RimsFieldsProps) {
  const rimDepth = data.rimDepth || 30;
  const internalWidth = data.internalWidth || 21;

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja koła</h4>

      <div className="space-y-2">
        <Label htmlFor="rims-material">Materiał</Label>
        <Select
          value={data.material || "aluminum"}
          onValueChange={(value) =>
            onChange({ ...data, material: value as RimsSpecificData["material"] })
          }
        >
          <SelectTrigger id="rims-material">
            <SelectValue placeholder="Wybierz materiał" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aluminum">Aluminium</SelectItem>
            <SelectItem value="carbon">Carbon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rims-depth">Profil obręczy (mm)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, rimDepth: clamp(rimDepth - 5, 15, 90) })}
            disabled={rimDepth <= 15}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="rims-depth"
            type="number"
            min={15}
            max={90}
            value={rimDepth}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (num) onChange({ ...data, rimDepth: clamp(num, 15, 90) });
            }}
            className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, rimDepth: clamp(rimDepth + 5, 15, 90) })}
            disabled={rimDepth >= 90}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rims-internal-width">Szerokość wewnętrzna (mm)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, internalWidth: clamp(internalWidth - 1, 13, 45) })}
            disabled={internalWidth <= 13}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="rims-internal-width"
            type="number"
            min={13}
            max={45}
            value={internalWidth}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (num) onChange({ ...data, internalWidth: clamp(num, 13, 45) });
            }}
            className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ ...data, internalWidth: clamp(internalWidth + 1, 13, 45) })}
            disabled={internalWidth >= 45}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rims-hookless"
          checked={data.hookless ?? false}
          onCheckedChange={(checked) =>
            onChange({ ...data, hookless: checked === true })
          }
        />
        <Label htmlFor="rims-hookless" className="cursor-pointer">Hookless (TSS)</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rims-tubeless"
          checked={data.tubelessReady ?? false}
          onCheckedChange={(checked) =>
            onChange({ ...data, tubelessReady: checked === true })
          }
        />
        <Label htmlFor="rims-tubeless" className="cursor-pointer">Tubeless Ready</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rims-brake-type">Typ hamulca</Label>
        <Select
          value={data.brakeType || "disc"}
          onValueChange={(value) =>
            onChange({ ...data, brakeType: value as RimsSpecificData["brakeType"] })
          }
        >
          <SelectTrigger id="rims-brake-type">
            <SelectValue placeholder="Wybierz typ hamulca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disc">Tarczowy</SelectItem>
            <SelectItem value="rim">Szczękowy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rims-wheel-size">Rozmiar koła</Label>
        <Select
          value={data.wheelSize || "28"}
          onValueChange={(value) =>
            onChange({ ...data, wheelSize: value as RimsSpecificData["wheelSize"] })
          }
        >
          <SelectTrigger id="rims-wheel-size">
            <SelectValue placeholder="Wybierz rozmiar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="26">26&quot;</SelectItem>
            <SelectItem value="27.5">27.5&quot;</SelectItem>
            <SelectItem value="28">28&quot; / 700C</SelectItem>
            <SelectItem value="29">29&quot;</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import NumberStepper from "@/components/ui/number-stepper";
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

  return (
    <div className="space-y-4">
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
        <Label>Profil obręczy (mm)</Label>
        <NumberStepper
          value={rimDepth}
          onChange={(v) => onChange({ ...data, rimDepth: v })}
          steps={[5]}
          min={15}
          max={90}
        />
      </div>

      <div className="space-y-2">
        <Label>Szerokość wewnętrzna (mm)</Label>
        <NumberStepper
          value={internalWidth}
          onChange={(v) => onChange({ ...data, internalWidth: v })}
          steps={[1]}
          min={13}
          max={45}
        />
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

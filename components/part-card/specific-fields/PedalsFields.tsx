"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PedalsSpecificData } from "@/lib/part-specific-data";

interface PedalsFieldsProps {
  data: Partial<PedalsSpecificData>;
  onChange: (data: Partial<PedalsSpecificData>) => void;
}

const CLIPLESS_OPTIONS: { value: PedalsSpecificData["clipless"]; label: string }[] = [
  { value: "no", label: "Nie" },
  { value: "yes", label: "Tak" },
  { value: "one-sided", label: "Jednostronne" },
  { value: "magnetic", label: "Magnetyczne" },
  { value: "two-sided", label: "Dwustronne" },
];

const BEARING_OPTIONS: { value: PedalsSpecificData["bearings"]; label: string }[] = [
  { value: "ceramic", label: "Ceramiczne" },
  { value: "needle", label: "Igiełkowe" },
  { value: "ball", label: "Kulkowe" },
  { value: "cartridge", label: "Maszynowe" },
  { value: "steel", label: "Stalowe" },
  { value: "bushing", label: "Ślizgowe" },
];

const BODY_MATERIAL_OPTIONS: { value: PedalsSpecificData["bodyMaterial"]; label: string }[] = [
  { value: "aluminum", label: "Aluminium" },
  { value: "carbon", label: "Carbon" },
  { value: "composite", label: "Kompozyt" },
  { value: "nylon", label: "Nylon" },
  { value: "steel", label: "Stal" },
  { value: "magnesium", label: "Stop magnezu" },
  { value: "plastic", label: "Tworzywo" },
  { value: "titanium", label: "Tytan" },
  { value: "fiberglass", label: "Włókno szklane" },
];

export default function PedalsFields({ data, onChange }: PedalsFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja pedałów</h4>

      <div className="space-y-2">
        <Label htmlFor="pedals-clipless">Zatrzaskowe</Label>
        <Select
          value={data.clipless || ""}
          onValueChange={(value) =>
            onChange({ ...data, clipless: value as PedalsSpecificData["clipless"] })
          }
        >
          <SelectTrigger id="pedals-clipless">
            <SelectValue placeholder="Wybierz typ" />
          </SelectTrigger>
          <SelectContent>
            {CLIPLESS_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pedals-bearings">Łożyska</Label>
        <Select
          value={data.bearings || ""}
          onValueChange={(value) =>
            onChange({ ...data, bearings: value as PedalsSpecificData["bearings"] })
          }
        >
          <SelectTrigger id="pedals-bearings">
            <SelectValue placeholder="Wybierz łożyska" />
          </SelectTrigger>
          <SelectContent>
            {BEARING_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="pedals-platform"
          checked={data.platform ?? false}
          onCheckedChange={(checked) =>
            onChange({ ...data, platform: checked === true })
          }
        />
        <Label htmlFor="pedals-platform" className="cursor-pointer">Platforma</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pedals-body-material">Materiał korpusu</Label>
        <Select
          value={data.bodyMaterial || ""}
          onValueChange={(value) =>
            onChange({ ...data, bodyMaterial: value as PedalsSpecificData["bodyMaterial"] })
          }
        >
          <SelectTrigger id="pedals-body-material">
            <SelectValue placeholder="Wybierz materiał" />
          </SelectTrigger>
          <SelectContent>
            {BODY_MATERIAL_OPTIONS.map((item) => (
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

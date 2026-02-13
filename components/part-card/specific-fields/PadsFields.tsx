"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PadsSpecificData } from "@/lib/part-specific-data";

interface PadsFieldsProps {
  data: Partial<PadsSpecificData>;
  onChange: (data: Partial<PadsSpecificData>) => void;
}

export default function PadsFields({ data, onChange }: PadsFieldsProps) {
  const isRimBrake = data.rimBrake ?? false;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pads-brake-type">Typ hamulca</Label>
        <Select
          value={isRimBrake ? "rim" : "disc"}
          onValueChange={(value) => {
            if (value === "rim") {
              onChange({ rimBrake: true, rim: data.rim || "aluminum" });
            } else {
              onChange({ rimBrake: false, material: data.material || "organic" });
            }
          }}
        >
          <SelectTrigger id="pads-brake-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rim">Szczękowe</SelectItem>
            <SelectItem value="disc">Tarczowe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isRimBrake ? (
        <div className="space-y-2">
          <Label htmlFor="pads-rim">Obręcz</Label>
          <Select
            value={data.rim || "aluminum"}
            onValueChange={(value) =>
              onChange({
                ...data,
                rim: value as PadsSpecificData["rim"],
              })
            }
          >
            <SelectTrigger id="pads-rim">
              <SelectValue placeholder="Wybierz typ obręczy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aluminum">Aluminium</SelectItem>
              <SelectItem value="carbon">Carbon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="pads-material">Materiał</Label>
          <Select
            value={data.material || "organic"}
            onValueChange={(value) =>
              onChange({
                ...data,
                material: value as PadsSpecificData["material"],
              })
            }
          >
            <SelectTrigger id="pads-material">
              <SelectValue placeholder="Wybierz materiał" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semi-metallic">Półmetaliczne</SelectItem>
              <SelectItem value="resin-kevlar">Mieszanka żywicy i kevlaru</SelectItem>
              <SelectItem value="ceramic">Ceramiczne</SelectItem>
              <SelectItem value="metallic">Metaliczne</SelectItem>
              <SelectItem value="mixed">Mieszane</SelectItem>
              <SelectItem value="organic">Organiczne / żywiczne</SelectItem>
              <SelectItem value="organic-radiator">Organiczne / żywiczne z radiatorem</SelectItem>
              <SelectItem value="metallic-radiator">Metaliczne z radiatorem</SelectItem>
              <SelectItem value="semi-metallic-radiator">Półmetaliczne z radiatorem</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FrameSpecificData } from "@/lib/part-specific-data";

interface FrameFieldsProps {
  data: Partial<FrameSpecificData>;
  onChange: (data: Partial<FrameSpecificData>) => void;
}

const MATERIALS = [
  { value: "aluminum", label: "Aluminium" },
  { value: "carbon", label: "Carbon" },
  { value: "titanium", label: "Tytan" },
  { value: "steel", label: "Stal" },
];

const BRAKE_TYPES = [
  { value: "rim", label: "Szczękowy" },
  { value: "disc", label: "Tarczowy" },
  { value: "disc-hydraulic", label: "Tarczowy hydrauliczny" },
  { value: "v-brake", label: "V-Brake" },
];

const WHEEL_SIZES = [
  { value: "24", label: '24"' },
  { value: "26", label: '26"' },
  { value: "27.5", label: '27.5"' },
  { value: "28", label: '28"' },
  { value: "29", label: '29"' },
];

const FRAME_SIZES = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "xxl", label: "XXL" },
  { value: "one-size", label: "One size" },
];

const GENDERS = [
  { value: "women", label: "Damska" },
  { value: "men", label: "Męska" },
];

export default function FrameFields({ data, onChange }: FrameFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja ramy</h4>

      <div className="space-y-2">
        <Label htmlFor="frame-material">Materiał</Label>
        <Select
          value={data.material || ""}
          onValueChange={(value) =>
            onChange({ ...data, material: value as FrameSpecificData["material"] })
          }
        >
          <SelectTrigger id="frame-material">
            <SelectValue placeholder="Wybierz materiał" />
          </SelectTrigger>
          <SelectContent>
            {MATERIALS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frame-brake-type">Typ hamulców</Label>
        <Select
          value={data.brakeType || ""}
          onValueChange={(value) =>
            onChange({ ...data, brakeType: value as FrameSpecificData["brakeType"] })
          }
        >
          <SelectTrigger id="frame-brake-type">
            <SelectValue placeholder="Wybierz typ hamulców" />
          </SelectTrigger>
          <SelectContent>
            {BRAKE_TYPES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frame-wheel-size">Rozmiar koła</Label>
        <Select
          value={data.wheelSize || ""}
          onValueChange={(value) =>
            onChange({ ...data, wheelSize: value as FrameSpecificData["wheelSize"] })
          }
        >
          <SelectTrigger id="frame-wheel-size">
            <SelectValue placeholder="Wybierz rozmiar koła" />
          </SelectTrigger>
          <SelectContent>
            {WHEEL_SIZES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frame-size">Rozmiar ramy</Label>
        <Select
          value={data.frameSize || ""}
          onValueChange={(value) =>
            onChange({ ...data, frameSize: value as FrameSpecificData["frameSize"] })
          }
        >
          <SelectTrigger id="frame-size">
            <SelectValue placeholder="Wybierz rozmiar ramy" />
          </SelectTrigger>
          <SelectContent>
            {FRAME_SIZES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frame-gender">Płeć</Label>
        <Select
          value={data.gender || ""}
          onValueChange={(value) =>
            onChange({ ...data, gender: value as FrameSpecificData["gender"] })
          }
        >
          <SelectTrigger id="frame-gender">
            <SelectValue placeholder="Wybierz typ ramy" />
          </SelectTrigger>
          <SelectContent>
            {GENDERS.map((item) => (
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

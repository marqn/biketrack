"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FrameSpecificData } from "@/lib/part-specific-data";
import { BikeType } from "@/lib/generated/prisma";

interface FrameFieldsProps {
  data: Partial<FrameSpecificData>;
  onChange: (data: Partial<FrameSpecificData>) => void;
  bikeType?: BikeType;
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
  { value: "unisex", label: "Unisex" },
];

const TRAINER_TYPES = [
  { value: "direct-drive", label: "Direct Drive" },
  { value: "wheel-on", label: "Wheel-on" },
  { value: "standalone", label: "Rower stacjonarny" },
  { value: "rollers", label: "Rolki" },
];

export default function FrameFields({ data, onChange, bikeType }: FrameFieldsProps) {
  const isTrainer = bikeType === BikeType.TRAINER;

  return (
    <div className="space-y-4">
      {isTrainer ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="trainer-type">Typ trenażera</Label>
            <Select
              value={data.trainerType || ""}
              onValueChange={(value) =>
                onChange({ ...data, trainerType: value as FrameSpecificData["trainerType"] })
              }
            >
              <SelectTrigger id="trainer-type">
                <SelectValue placeholder="Wybierz typ trenażera" />
              </SelectTrigger>
              <SelectContent>
                {TRAINER_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-power">Maks. moc oporu (W)</Label>
            <Input
              id="max-power"
              type="number"
              placeholder="np. 2200"
              value={data.maxPower ?? ""}
              onChange={(e) =>
                onChange({ ...data, maxPower: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-grade">Maks. symulowane nachylenie (%)</Label>
            <Input
              id="max-grade"
              type="number"
              placeholder="np. 20"
              value={data.maxSimulatedGrade ?? ""}
              onChange={(e) =>
                onChange({ ...data, maxSimulatedGrade: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Łączność</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="connectivity-ant"
                  checked={data.connectivity?.includes("ant+") ?? false}
                  onCheckedChange={(checked) => {
                    const current = data.connectivity || [];
                    const updated = checked
                      ? [...current.filter((c) => c !== "ant+"), "ant+"]
                      : current.filter((c) => c !== "ant+");
                    onChange({ ...data, connectivity: updated.length > 0 ? updated as ("ant+" | "bluetooth")[] : undefined });
                  }}
                />
                <Label htmlFor="connectivity-ant" className="font-normal">ANT+</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="connectivity-bt"
                  checked={data.connectivity?.includes("bluetooth") ?? false}
                  onCheckedChange={(checked) => {
                    const current = data.connectivity || [];
                    const updated = checked
                      ? [...current.filter((c) => c !== "bluetooth"), "bluetooth"]
                      : current.filter((c) => c !== "bluetooth");
                    onChange({ ...data, connectivity: updated.length > 0 ? updated as ("ant+" | "bluetooth")[] : undefined });
                  }}
                />
                <Label htmlFor="connectivity-bt" className="font-normal">Bluetooth</Label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="foldable"
              checked={data.foldable ?? false}
              onCheckedChange={(checked) =>
                onChange({ ...data, foldable: !!checked })
              }
            />
            <Label htmlFor="foldable" className="font-normal">Składany</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frame-size">Rozmiar</Label>
            <Select
              value={data.frameSize || ""}
              onValueChange={(value) =>
                onChange({ ...data, frameSize: value as FrameSpecificData["frameSize"] })
              }
            >
              <SelectTrigger id="frame-size">
                <SelectValue placeholder="Wybierz rozmiar" />
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
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
